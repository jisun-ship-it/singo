import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { getConnection } from './db'

interface SlackMessageEvent {
  type: 'message'
  channel: string
  user?: string
  text: string
  ts: string
  thread_ts?: string
  subtype?: string
  bot_id?: string
}

interface SlackMessageDeletedEvent {
  type: 'message'
  subtype: 'message_deleted'
  channel: string
  ts: string
  deleted_ts?: string
  previous_message?: { ts: string }
}

interface SlackEventCallback {
  type: 'event_callback'
  team_id: string
  event: SlackMessageEvent | { type: string }
}

interface SlackUrlVerification {
  type: 'url_verification'
  challenge: string
}

type SlackPayload = SlackUrlVerification | SlackEventCallback | { type: string }

async function isChannelSubscribed(
  supabase: ReturnType<typeof createClient>,
  teamId: string,
  channelId: string,
): Promise<{ subscribed: boolean; targetLanguage: string } | null> {
  const { data, error } = await supabase
    .from('channel_subscriptions')
    .select('subscribed,target_language')
    .eq('team_id', teamId)
    .eq('channel_id', channelId)
    .single()
  if (error) {
    if (error.code !== 'PGRST116') console.error('isChannelSubscribed DB error:', error)
    return null
  }
  const row = data as { subscribed: boolean; target_language: string | null } | null
  if (!row) return null
  return { subscribed: row.subscribed === true, targetLanguage: row.target_language ?? 'English' }
}

async function getChannelName(botToken: string, channelId: string): Promise<string> {
  const url = `https://slack.com/api/conversations.info?channel=${channelId}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${botToken}` },
  })
  const data = (await response.json()) as { ok: boolean; channel?: { name: string } }
  return data.channel?.name ?? channelId
}

async function translateWithOpenAI(text: string, apiKey: string, targetLanguage: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Translate the following message to ${targetLanguage}. Return only the translated text, no explanation:\n\n${text}`,
        },
      ],
    }),
  })
  if (!response.ok) {
    throw new Error(`OpenAI API error: HTTP ${response.status}`)
  }
  const data = (await response.json()) as {
    choices?: Array<{ message: { content: string } }>
  }
  const translated = data.choices?.[0]?.message?.content
  if (!translated) {
    throw new Error('OpenAI API returned no content')
  }
  return translated
}

async function findOrCreateMirrorChannel(botToken: string, sourceName: string): Promise<string> {
  const mirrorName = `mirror-${sourceName}`

  const createResponse = await fetch('https://slack.com/api/conversations.create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: mirrorName }),
  })
  const createData = (await createResponse.json()) as {
    ok: boolean
    channel?: { id: string }
    error?: string
  }

  if (createData.ok && createData.channel) {
    return createData.channel.id
  }

  if (createData.error === 'name_taken') {
    const listResponse = await fetch(
      'https://slack.com/api/conversations.list?exclude_archived=true&types=public_channel',
      { headers: { Authorization: `Bearer ${botToken}` } },
    )
    const listData = (await listResponse.json()) as {
      ok: boolean
      channels?: Array<{ id: string; name: string }>
    }
    const found = listData.channels?.find((ch) => ch.name === mirrorName)
    if (found) return found.id
  }

  throw new Error(`Failed to find or create mirror channel for ${sourceName}`)
}

async function postToSlack(
  botToken: string,
  channelId: string,
  text: string,
  threadTs?: string,
): Promise<string> {
  const body: { channel: string; text: string; thread_ts?: string } = { channel: channelId, text }
  if (threadTs) body.thread_ts = threadTs
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = (await response.json()) as { ok: boolean; error?: string; ts?: string }
  if (!data.ok) {
    throw new Error(`Slack postMessage error: ${data.error ?? 'unknown'}`)
  }
  return data.ts ?? ''
}

async function deleteFromSlack(botToken: string, channelId: string, ts: string): Promise<void> {
  const response = await fetch('https://slack.com/api/chat.delete', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel: channelId, ts }),
  })
  const data = (await response.json()) as { ok: boolean; error?: string }
  if (!data.ok) {
    throw new Error(`Slack chat.delete error: ${data.error ?? 'unknown'}`)
  }
}

async function saveMirrorMapping(
  supabase: ReturnType<typeof createClient>,
  sourceChannel: string,
  sourceTs: string,
  mirrorChannel: string,
  mirrorTs: string,
): Promise<void> {
  const { error } = await supabase
    .from('message_mirror_map')
    .insert({ source_channel: sourceChannel, source_ts: sourceTs, mirror_channel: mirrorChannel, mirror_ts: mirrorTs })
  if (error) console.error('saveMirrorMapping error:', error)
}

async function lookupMirrorMapping(
  supabase: ReturnType<typeof createClient>,
  sourceChannel: string,
  sourceTs: string,
): Promise<{ mirrorChannel: string; mirrorTs: string } | null> {
  const { data, error } = await supabase
    .from('message_mirror_map')
    .select('mirror_channel, mirror_ts')
    .eq('source_channel', sourceChannel)
    .eq('source_ts', sourceTs)
    .single()
  if (error) {
    if (error.code !== 'PGRST116') console.error('lookupMirrorMapping error:', error)
    return null
  }
  const row = data as { mirror_channel: string; mirror_ts: string } | null
  if (!row) return null
  return { mirrorChannel: row.mirror_channel, mirrorTs: row.mirror_ts }
}

export const handler: Handler = async (event) => {
  const retryNum = event.headers['x-slack-retry-num'] ?? event.headers['X-Slack-Retry-Num']
  if (retryNum) {
    console.log('[slack-events] skipping retry event, x-slack-retry-num:', retryNum)
    return { statusCode: 200, body: '' }
  }

  const body = JSON.parse(event.body ?? '{}') as SlackPayload

  if (body.type === 'url_verification') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge: (body as SlackUrlVerification).challenge }),
    }
  }

  if (body.type !== 'event_callback') {
    return { statusCode: 200, body: '' }
  }

  const payload = body as SlackEventCallback
  const slackEvent = payload.event

  if (slackEvent.type !== 'message') {
    return { statusCode: 200, body: '' }
  }

  const messageEvent = slackEvent as SlackMessageEvent
  if (messageEvent.bot_id) {
    return { statusCode: 200, body: '' }
  }
  if (messageEvent.subtype && messageEvent.subtype !== 'message_deleted') {
    console.log('[slack-events] skipping subtype:', messageEvent.subtype)
    return { statusCode: 200, body: '' }
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const openaiApiKey = process.env.OPEN_API_KEY ?? ''

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const connection = await getConnection(supabase)
  if (!connection) {
    console.log('[slack-events] no connection, skip')
    return { statusCode: 200, body: '' }
  }

  if (messageEvent.subtype === 'message_deleted') {
    const deletedEvent = messageEvent as unknown as SlackMessageDeletedEvent
    const deletedTs = deletedEvent.deleted_ts ?? deletedEvent.previous_message?.ts
    if (deletedTs) {
      try {
        const mapping = await lookupMirrorMapping(supabase, messageEvent.channel, deletedTs)
        if (mapping) {
          await deleteFromSlack(connection.access_token, mapping.mirrorChannel, mapping.mirrorTs)
        }
      } catch (err) {
        console.error('slack-events delete error:', err)
      }
    }
    return { statusCode: 200, body: '' }
  }

  const subscription = await isChannelSubscribed(supabase, connection.team_id, messageEvent.channel)
  console.log('[slack-events] channel', messageEvent.channel, 'subscribed:', subscription?.subscribed ?? false)
  if (!subscription?.subscribed) return { statusCode: 200, body: '' }

  try {
    const channelName = await getChannelName(connection.access_token, messageEvent.channel)
    console.log('[slack-events] channelName:', channelName)
    const translatedText = await translateWithOpenAI(messageEvent.text, openaiApiKey, subscription.targetLanguage)
    console.log('[slack-events] translated:', translatedText)
    const mirrorChannelId = await findOrCreateMirrorChannel(connection.access_token, channelName)
    console.log('[slack-events] mirrorChannelId:', mirrorChannelId)

    if (messageEvent.thread_ts) {
      const mapping = await lookupMirrorMapping(supabase, messageEvent.channel, messageEvent.thread_ts)
      const postedTs = await postToSlack(connection.access_token, mirrorChannelId, translatedText, mapping?.mirrorTs)
      await saveMirrorMapping(supabase, messageEvent.channel, messageEvent.ts, mirrorChannelId, postedTs)
    } else {
      const mirrorTs = await postToSlack(connection.access_token, mirrorChannelId, translatedText)
      await saveMirrorMapping(supabase, messageEvent.channel, messageEvent.ts, mirrorChannelId, mirrorTs)
    }
    console.log('[slack-events] posted successfully')
  } catch (err) {
    console.error('slack-events handler error:', err)
  }

  return { statusCode: 200, body: '' }
}
