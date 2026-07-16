import { describe, it, expect } from 'vitest'
import { buildSlackOAuthUrl } from './slack'

describe('buildSlackOAuthUrl', () => {
  it('returns a Slack OAuth v2 URL', () => {
    const url = buildSlackOAuthUrl({
      clientId: 'test-client-id',
      redirectUri: 'https://example.com/callback',
    })
    const parsed = new URL(url)
    expect(parsed.host).toBe('slack.com')
    expect(parsed.pathname).toBe('/oauth/v2/authorize')
  })

  it('includes client_id and redirect_uri as query params', () => {
    const url = buildSlackOAuthUrl({
      clientId: 'my-client',
      redirectUri: 'https://app.example.com/callback',
    })
    const params = new URL(url).searchParams
    expect(params.get('client_id')).toBe('my-client')
    expect(params.get('redirect_uri')).toBe('https://app.example.com/callback')
  })

  it('requests the required bot scopes', () => {
    const url = buildSlackOAuthUrl({
      clientId: 'cid',
      redirectUri: 'https://x.com/cb',
    })
    const scope = new URL(url).searchParams.get('scope') ?? ''
    expect(scope).toContain('channels:read')
    expect(scope).toContain('channels:history')
    expect(scope).toContain('chat:write')
    expect(scope).toContain('im:write')
  })
})
