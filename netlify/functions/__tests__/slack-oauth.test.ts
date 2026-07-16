import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { HandlerEvent } from '@netlify/functions'

vi.mock('@supabase/supabase-js')

import { createClient } from '@supabase/supabase-js'
import { handler } from '../slack-oauth'

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

function makeSupabaseMock({ upsertError = null }: { upsertError?: object | null } = {}) {
  const mockUpsert = vi.fn().mockResolvedValue({ error: upsertError })
  vi.mocked(createClient).mockReturnValue({
    from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
  } as ReturnType<typeof createClient>)
  return { mockUpsert }
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
    makeSupabaseMock()
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({
        ok: true,
        access_token: 'xoxb-test',
        team: { id: 'T123', name: 'Test Workspace' },
        bot_user_id: 'U456',
      }),
    } as Response)

    const result = await handler(makeEvent({ code: 'valid-code' }), {} as never, vi.fn())
    expect(result?.statusCode).toBe(302)
    expect(result?.headers?.Location).toBe('/settings?connected=true')
  })

  it('redirects to /settings?error=save_failed when Supabase upsert fails', async () => {
    makeSupabaseMock({ upsertError: { message: 'DB error', code: '42P01' } })
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({
        ok: true,
        access_token: 'xoxb-test',
        team: { id: 'T123', name: 'Test Workspace' },
        bot_user_id: 'U456',
      }),
    } as Response)

    const result = await handler(makeEvent({ code: 'valid-code' }), {} as never, vi.fn())
    expect(result?.statusCode).toBe(302)
    expect(result?.headers?.Location).toBe('/settings?error=save_failed')
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

  it('builds redirectUri from request host header, not env var', async () => {
    makeSupabaseMock()
    let capturedBody: URLSearchParams | null = null
    vi.mocked(fetch).mockImplementationOnce(async (_url, init) => {
      capturedBody = new URLSearchParams(init?.body as string)
      return {
        json: async () => ({
          ok: true,
          access_token: 'xoxb-test',
          team: { id: 'T123', name: 'Test Workspace' },
          bot_user_id: 'U456',
        }),
      } as Response
    })

    const event = { ...makeEvent({ code: 'valid-code' }), headers: { host: 'dev-jay--singo-lingo.netlify.app' } }
    await handler(event, {} as never, vi.fn())

    expect(capturedBody?.get('redirect_uri')).toBe(
      'https://dev-jay--singo-lingo.netlify.app/.netlify/functions/slack-oauth',
    )
  })

  it('logs Slack error code when token exchange fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ ok: false, error: 'invalid_client_id' }),
    } as Response)

    await handler(makeEvent({ code: 'bad-code' }), {} as never, vi.fn())

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Slack token exchange failed'),
      'invalid_client_id',
    )
    consoleSpy.mockRestore()
  })
})
