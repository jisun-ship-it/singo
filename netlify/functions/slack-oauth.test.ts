import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handler } from './slack-oauth'
import type { HandlerEvent } from '@netlify/functions'

function makeEvent(params: Record<string, string>): HandlerEvent {
  return {
    queryStringParameters: params,
    httpMethod: 'GET',
    headers: {},
    body: null,
    isBase64Encoded: false,
    path: '/.netlify/functions/slack-oauth',
    rawUrl: '',
    rawQuery: '',
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
  }
}

describe('slack-oauth handler', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('SLACK_CLIENT_ID', 'test-client-id')
    vi.stubEnv('SLACK_CLIENT_SECRET', 'test-client-secret')
    vi.stubEnv('SLACK_REDIRECT_URI', 'https://example.com/callback')
    vi.stubEnv('SUPABASE_URL', 'https://db.example.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
  })

  it('redirects to /settings?connected=true on successful OAuth', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({
        ok: true,
        access_token: 'xoxb-test',
        team: { id: 'T123', name: 'Test Workspace' },
        bot_user_id: 'U456',
      }),
    } as Response)

    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({}),
      ok: true,
    } as Response)

    const result = await handler(makeEvent({ code: 'valid-code' }), {} as never, vi.fn())
    expect(result?.statusCode).toBe(302)
    expect(result?.headers?.Location).toBe('/settings?connected=true')
  })

  it('redirects to /settings?error=oauth_denied when user denies', async () => {
    const result = await handler(makeEvent({ error: 'access_denied' }), {} as never, vi.fn())
    expect(result?.statusCode).toBe(302)
    expect(result?.headers?.Location).toBe('/settings?error=oauth_denied')
  })

  it('redirects to /settings?error=token_exchange_failed when Slack returns error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ ok: false, error: 'invalid_code' }),
    } as Response)

    const result = await handler(makeEvent({ code: 'bad-code' }), {} as never, vi.fn())
    expect(result?.statusCode).toBe(302)
    expect(result?.headers?.Location).toBe('/settings?error=token_exchange_failed')
  })
})
