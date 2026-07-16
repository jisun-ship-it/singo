import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

interface SlackChannel {
  id: string
  name: string
}

interface SlackChannelsResponse {
  ok: boolean
  channels?: SlackChannel[]
  error?: string
}

async function getConnection(
  supabase: ReturnType<typeof createClient>,
): Promise<{ access_token: string; team_id: string } | null> {
  const { data, error } = await supabase
    .from('slack_connections')
    .select('access_token, team_id')
    .limit(1)
    .single()
  if (error || !data) return null
  return data as { access_token: string; team_id: string }
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

async function getSubscribedChannelIds(
  supabase: ReturnType<typeof createClient>,
  teamId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from('channel_subscriptions')
    .select('channel_id')
    .eq('team_id', teamId)
  return ((data ?? []) as { channel_id: string }[]).map((row) => row.channel_id)
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
    const subscribedIds = await getSubscribedChannelIds(supabase, connection.team_id)

    const result = channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      subscribed: subscribedIds.includes(ch.id),
    }))

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    }
  }

  if (event.httpMethod === 'POST') {
    const { channelId, subscribed } = JSON.parse(event.body ?? '{}') as {
      channelId: string
      subscribed: boolean
    }

    const connection = await getConnection(supabase)
    if (!connection) {
      return { statusCode: 401, body: JSON.stringify({ error: 'No workspace connected' }) }
    }

    await supabase
      .from('channel_subscriptions')
      .upsert({ team_id: connection.team_id, channel_id: channelId, subscribed }, { onConflict: 'team_id,channel_id' })

    return { statusCode: 200, body: '' }
  }

  return { statusCode: 405, body: 'Method not allowed' }
}
