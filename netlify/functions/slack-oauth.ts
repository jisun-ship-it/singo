import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

interface SlackOAuthResponse {
  ok: boolean
  access_token?: string
  team?: { id: string; name: string }
  bot_user_id?: string
  error?: string
}

async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<SlackOAuthResponse> {
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri }),
  })
  return response.json() as Promise<SlackOAuthResponse>
}

async function saveWorkspaceConnection(
  supabaseUrl: string,
  serviceRoleKey: string,
  data: { teamId: string; teamName: string; accessToken: string; botUserId: string },
): Promise<void> {
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  await supabase.from('slack_connections').upsert({
    team_id: data.teamId,
    team_name: data.teamName,
    access_token: data.accessToken,
    bot_user_id: data.botUserId,
  }, { onConflict: 'team_id' })
}

export const handler: Handler = async (event) => {
  const { error, code } = event.queryStringParameters ?? {}

  if (error) {
    return { statusCode: 302, headers: { Location: '/settings?error=oauth_denied' } }
  }

  if (!code) {
    return { statusCode: 400, body: 'Missing code parameter' }
  }

  const clientId = process.env.SLACK_CLIENT_ID ?? ''
  const clientSecret = process.env.SLACK_CLIENT_SECRET ?? ''
  const redirectUri = process.env.SLACK_REDIRECT_URI ?? ''
  const supabaseUrl = process.env.SUPABASE_URL ?? ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  const tokenData = await exchangeCodeForToken(code, clientId, clientSecret, redirectUri)

  if (!tokenData.ok) {
    return { statusCode: 302, headers: { Location: '/settings?error=token_exchange_failed' } }
  }

  await saveWorkspaceConnection(supabaseUrl, serviceRoleKey, {
    teamId: tokenData.team!.id,
    teamName: tokenData.team!.name,
    accessToken: tokenData.access_token!,
    botUserId: tokenData.bot_user_id!,
  })

  return { statusCode: 302, headers: { Location: '/settings?connected=true' } }
}
