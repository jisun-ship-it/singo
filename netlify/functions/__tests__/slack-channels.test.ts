import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { HandlerEvent } from '@netlify/functions'

vi.mock('@supabase/supabase-js')

import { createClient } from '@supabase/supabase-js'
import { handler } from '../slack-channels'

function makeEvent(method: string, body?: object): HandlerEvent {
  return {
    httpMethod: method,
    body: body ? JSON.stringify(body) : null,
    queryStringParameters: {},
    headers: {},
    isBase64Encoded: false,
    path: '/.netlify/functions/slack-channels',
    rawUrl: '',
    rawQuery: '',
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
  }
}

function makeSupabaseMock({
  connection = { data: { access_token: 'xoxb-test', team_id: 'T123' }, error: null },
  subscriptions = { data: [{ channel_id: 'C001' }], error: null },
  upsertResult = { error: null },
}: {
  connection?: object
  subscriptions?: object
  upsertResult?: object
} = {}) {
  const mockUpsert = vi.fn().mockResolvedValue(upsertResult)
  const mockSubscriptionsChain = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue(subscriptions),
    }),
    upsert: mockUpsert,
  }
  const mockConnectionChain = {
    select: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(connection),
      }),
    }),
    upsert: mockUpsert,
  }
  const mockFrom = vi.fn().mockImplementation((table: string) =>
    table === 'slack_connections' ? mockConnectionChain : mockSubscriptionsChain,
  )
  vi.mocked(createClient).mockReturnValue({ from: mockFrom } as ReturnType<typeof createClient>)
  return { mockFrom, mockUpsert }
}

describe('slack-channels handler — GET', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('SUPABASE_URL', 'https://db.example.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
  })

  it('returns 401 when no workspace is connected', async () => {
    makeSupabaseMock({ connection: { data: null, error: { message: 'no rows' } } })

    const result = await handler(makeEvent('GET'), {} as never, vi.fn())

    expect(result?.statusCode).toBe(401)
  })

  it('returns 500 when Slack API returns ok=false', async () => {
    makeSupabaseMock()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: false, error: 'missing_scope' }),
    } as Response)

    const result = await handler(makeEvent('GET'), {} as never, vi.fn())

    expect(result?.statusCode).toBe(500)
  })

  it('returns channels with subscription status', async () => {
    makeSupabaseMock()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        channels: [
          { id: 'C001', name: 'client-jp' },
          { id: 'C002', name: 'general' },
        ],
      }),
    } as Response)

    const result = await handler(makeEvent('GET'), {} as never, vi.fn())
    const body = JSON.parse(result?.body ?? '[]')

    expect(result?.statusCode).toBe(200)
    expect(body).toEqual([
      { id: 'C001', name: 'client-jp', subscribed: true },
      { id: 'C002', name: 'general', subscribed: false },
    ])
  })
})

describe('slack-channels handler — POST', () => {
  beforeEach(() => {
    vi.stubEnv('SUPABASE_URL', 'https://db.example.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
  })

  it('saves channel subscription and returns 200', async () => {
    const { mockUpsert } = makeSupabaseMock()

    const result = await handler(
      makeEvent('POST', { channelId: 'C002', subscribed: true }),
      {} as never,
      vi.fn(),
    )

    expect(result?.statusCode).toBe(200)
    expect(mockUpsert).toHaveBeenCalledWith(
      { team_id: 'T123', channel_id: 'C002', subscribed: true },
      { onConflict: 'team_id,channel_id' },
    )
  })
})

describe('slack-channels handler — unknown method', () => {
  it('returns 405', async () => {
    makeSupabaseMock()
    const result = await handler(makeEvent('DELETE'), {} as never, vi.fn())
    expect(result?.statusCode).toBe(405)
  })
})
