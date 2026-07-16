const BOT_SCOPES = 'channels:history,channels:read,chat:write,im:write'

interface SlackOAuthUrlParams {
  clientId: string
  redirectUri: string
}

export function buildSlackOAuthUrl({ clientId, redirectUri }: SlackOAuthUrlParams): string {
  const url = new URL('https://slack.com/oauth/v2/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('scope', BOT_SCOPES)
  url.searchParams.set('redirect_uri', redirectUri)
  return url.toString()
}
