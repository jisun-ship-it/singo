import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { getConnection } from './db'

interface SlackChannel {
  id: string
  name: string
}

interface SlackChannelsResponse {
  ok: boolean
  channels?: SlackChannel[]
  error?: string
}

async function listSlackChannels(botToken: string): Promise<SlackChannel[]> {
  const url = new URL('https://slack.com/api/conversations.list')
  url.searchParams.set('exclude_archived', 'true')
  url.searchParams.set('types', 'public_channel')
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${botToken}` },
  })
  const data: SlackChannelsResponse = (await response.json()) as SlackChannelsResponse
  if (!data.ok) throw new Error(`Slack API error: ${data.error ?? 'unknown'}`)
  return data.channels ?? []
}

async function getSubscriptionData(
  supabase: ReturnType<typeof createClient>,
  teamId: string,
): Promise<Map<string, { subscribed: boolean; target_language: string | null }>> {
  const { data, error } = await supabase
    .from('channel_subscriptions')
    .select('channel_id,subscribed,target_language')
    .eq('team_id', teamId)
  if (error) console.error('getSubscribedChannelIds DB error:', error)
  const map = new Map<string, { subscribed: boolean; target_language: string | null }>()
  for (const row of (data ?? []) as { channel_id: string; subscribed: boolean; target_language: string | null }[]) {
    map.set(row.channel_id, { subscribed: row.subscribed === true, target_language: row.target_language ?? null })
  }
  return map
}

export const handler: Handler = async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL ?? ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  if (event.httpMethod === 'GET') {
    const connection = await getConnection(supabase)
    if (!connection) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No workspace connected' }),
      }
    }

    let channels: SlackChannel[]
    try {
      channels = await listSlackChannels(connection.access_token)
    } catch (err) {
      console.error('Failed to list Slack channels:', err)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: (err as Error).message }),
      }
    }
    const subscriptionMap = await getSubscriptionData(supabase, connection.team_id)

    const result = channels.map((ch) => {
      const sub = subscriptionMap.get(ch.id)
      return {
        id: ch.id,
        name: ch.name,
        subscribed: sub?.subscribed === true,
        target_language: sub?.target_language ?? null,
      }
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    }
  }

  if (event.httpMethod === 'POST') {
    const { channelId, subscribed, targetLanguage } = JSON.parse(event.body ?? '{}') as {
      channelId: string
      subscribed?: boolean
      targetLanguage?: string
    }

    const connection = await getConnection(supabase)
    if (!connection) {
      return { statusCode: 401, body: JSON.stringify({ error: 'No workspace connected' }) }
    }

    const updateData: Record<string, unknown> = { team_id: connection.team_id, channel_id: channelId }
    if (subscribed !== undefined) updateData.subscribed = subscribed
    if (targetLanguage !== undefined) updateData.target_language = targetLanguage

    await supabase
      .from('channel_subscriptions')
      .upsert(updateData, { onConflict: 'team_id,channel_id' })

    return { statusCode: 200, body: '' }
  }

  return { statusCode: 405, body: 'Method not allowed' }
}
