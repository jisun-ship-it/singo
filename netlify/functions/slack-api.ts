import { createClient } from '@supabase/supabase-js'

export interface SenderInfo {
  username: string
  icon_url: string
}

export async function getChannelName(botToken: string, channelId: string): Promise<string> {
  const url = `https://slack.com/api/conversations.info?channel=${channelId}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${botToken}` },
  })
  const data = (await response.json()) as { ok: boolean; channel?: { name: string } }
  return data.channel?.name ?? channelId
}

export async function getSenderInfo(botToken: string, userId: string): Promise<SenderInfo | null> {
  try {
    const response = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
      headers: { Authorization: `Bearer ${botToken}` },
    })
    const data = (await response.json()) as {
      ok: boolean
      user?: { real_name?: string; profile?: { image_192?: string } }
    }
    if (!data.ok || !data.user) return null
    const username = data.user.real_name ?? ''
    const icon_url = data.user.profile?.image_192 ?? ''
    if (!username && !icon_url) return null
    return { username, icon_url }
  } catch {
    return null
  }
}

export async function postToSlack(
  botToken: string,
  channelId: string,
  text: string,
  threadTs?: string,
  senderInfo?: SenderInfo | null,
): Promise<string> {
  const body: {
    channel: string
    text: string
    thread_ts?: string
    username?: string
    icon_url?: string
  } = { channel: channelId, text }
  if (threadTs) body.thread_ts = threadTs
  if (senderInfo?.username) body.username = senderInfo.username
  if (senderInfo?.icon_url) body.icon_url = senderInfo.icon_url
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

export async function deleteFromSlack(botToken: string, channelId: string, ts: string): Promise<void> {
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

async function saveMirrorChannelRecord(
  supabase: ReturnType<typeof createClient>,
  teamId: string,
  channelId: string,
): Promise<void> {
  const { error } = await supabase
    .from('mirror_channels')
    .upsert({ team_id: teamId, channel_id: channelId }, { onConflict: 'team_id,channel_id' })
  if (error) console.error('saveMirrorChannelRecord error:', error)
}

export async function findOrCreateMirrorChannel(
  botToken: string,
  sourceName: string,
  supabase: ReturnType<typeof createClient>,
  teamId: string,
): Promise<string> {
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
    await saveMirrorChannelRecord(supabase, teamId, createData.channel.id)
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
    if (found) {
      await saveMirrorChannelRecord(supabase, teamId, found.id)
      return found.id
    }
  }

  throw new Error(`Failed to find or create mirror channel for ${sourceName}`)
}
