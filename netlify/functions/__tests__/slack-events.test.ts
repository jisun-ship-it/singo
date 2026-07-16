import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { HandlerEvent } from '@netlify/functions'

vi.mock('@supabase/supabase-js')

import { createClient } from '@supabase/supabase-js'
import { handler } from '../slack-events'

function makeEvent(body: object): HandlerEvent {
  return {
    httpMethod: 'POST',
    body: JSON.stringify(body),
    queryStringParameters: {},
    headers: {},
    isBase64Encoded: false,
    path: '/.netlify/functions/slack-events',
    rawUrl: '',
    rawQuery: '',
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
  }
}

function makeMessageEvent(channelId: string, text = 'こんにちは', botId?: string) {
  return makeEvent({
    type: 'event_callback',
    team_id: 'T123',
    event: {
      type: 'message',
      channel: channelId,
      user: 'U123',
      text,
      ts: '1234567890.000001',
      ...(botId ? { bot_id: botId } : {}),
    },
  })
}

function makeSupabaseMock({
  connection = { data: { access_token: 'xoxb-test', team_id: 'T123' }, error: null },
  subscription = { data: { subscribed: true }, error: null },
}: {
  connection?: object
  subscription?: object
} = {}) {
  const subscriptionChain = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(subscription),
        }),
      }),
    }),
  }
  const connectionChain = {
    select: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(connection),
      }),
    }),
  }
  const mockFrom = vi.fn().mockImplementation((table: string) =>
    table === 'slack_connections' ? connectionChain : subscriptionChain,
  )
  vi.mocked(createClient).mockReturnValue({ from: mockFrom } as ReturnType<typeof createClient>)
}

const CONVERSATIONS_INFO_OK = {
  ok: true,
  json: async () => ({ ok: true, channel: { id: 'C001', name: 'client-jp' } }),
} as Response

const OPENAI_TRANSLATE_OK = {
  ok: true,
  json: async () => ({ choices: [{ message: { content: 'Hello' } }] }),
} as Response

const CONVERSATIONS_CREATE_OK = {
  ok: true,
  json: async () => ({ ok: true, channel: { id: 'C_MIRROR' } }),
} as Response

const CONVERSATIONS_CREATE_NAME_TAKEN = {
  ok: true,
  json: async () => ({ ok: false, error: 'name_taken' }),
} as Response

const CONVERSATIONS_LIST_WITH_MIRROR = {
  ok: true,
  json: async () => ({
    ok: true,
    channels: [{ id: 'C_EXISTING', name: 'mirror-client-jp' }],
  }),
} as Response

const CHAT_POST_OK = {
  ok: true,
  json: async () => ({ ok: true }),
} as Response

describe('slack-events handler — url_verification', () => {
  it('responds with challenge', async () => {
    const event = makeEvent({ type: 'url_verification', challenge: 'abc123' })
    const result = await handler(event, {} as never, vi.fn())

    expect(result?.statusCode).toBe(200)
    expect(JSON.parse(result?.body ?? '{}')).toEqual({ challenge: 'abc123' })
  })
})

describe('slack-events handler — early exits (no DB/fetch)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('SUPABASE_URL', 'https://db.example.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
    vi.stubEnv('OPEN_API_KEY', 'test-api-key')
  })

  it('ignores unknown top-level event types', async () => {
    const event = makeEvent({ type: 'something_else' })
    const result = await handler(event, {} as never, vi.fn())

    expect(result?.statusCode).toBe(200)
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('ignores non-message event subtypes', async () => {
    const event = makeEvent({
      type: 'event_callback',
      event: { type: 'reaction_added', channel: 'C001' },
    })
    const result = await handler(event, {} as never, vi.fn())

    expect(result?.statusCode).toBe(200)
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('ignores bot messages to prevent forwarding loops', async () => {
    const result = await handler(makeMessageEvent('C001', 'Bot says hi', 'B_BOT'), {} as never, vi.fn())

    expect(result?.statusCode).toBe(200)
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })
})

describe('slack-events handler — error handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('SUPABASE_URL', 'https://db.example.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
    vi.stubEnv('OPEN_API_KEY', 'test-api-key')
  })

  it('returns 200 and logs when Claude API responds with non-ok HTTP status', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    makeSupabaseMock()
    vi.mocked(fetch)
      .mockResolvedValueOnce(CONVERSATIONS_INFO_OK)
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) } as Response)

    const result = await handler(makeMessageEvent('C001'), {} as never, vi.fn())

    expect(result?.statusCode).toBe(200)
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('slack-events handler error'),
      expect.any(Error),
    )
    consoleSpy.mockRestore()
  })

  it('returns 200 and logs when Slack postMessage returns ok=false', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    makeSupabaseMock()
    vi.mocked(fetch)
      .mockResolvedValueOnce(CONVERSATIONS_INFO_OK)
      .mockResolvedValueOnce(OPENAI_TRANSLATE_OK)
      .mockResolvedValueOnce(CONVERSATIONS_CREATE_OK)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: false, error: 'channel_not_found' }),
      } as Response)

    const result = await handler(makeMessageEvent('C001'), {} as never, vi.fn())

    expect(result?.statusCode).toBe(200)
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('slack-events handler error'),
      expect.any(Error),
    )
    consoleSpy.mockRestore()
  })

  it('logs DB error and skips processing when subscription query fails with unexpected error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    makeSupabaseMock({
      subscription: { data: null, error: { code: '42P01', message: 'relation not found' } },
    })

    const result = await handler(makeMessageEvent('C001'), {} as never, vi.fn())

    expect(result?.statusCode).toBe(200)
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('isChannelSubscribed'),
      expect.objectContaining({ message: 'relation not found' }),
    )
    consoleSpy.mockRestore()
  })
})

describe('slack-events handler — diagnostic logs', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('SUPABASE_URL', 'https://db.example.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
    vi.stubEnv('OPEN_API_KEY', 'test-api-key')
  })

  it('logs no connection when workspace is not connected', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    makeSupabaseMock({ connection: { data: null, error: { code: 'PGRST116', message: 'no rows' } } })

    await handler(makeMessageEvent('C001'), {} as never, vi.fn())

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('no connection'))
    consoleSpy.mockRestore()
  })

  it('passes OPEN_API_KEY env var as Bearer token to OpenAI', async () => {
    makeSupabaseMock()
    let capturedHeaders: Record<string, string> | null = null
    vi.mocked(fetch)
      .mockResolvedValueOnce(CONVERSATIONS_INFO_OK)
      .mockImplementationOnce(async (_url, init) => {
        capturedHeaders = init?.headers as Record<string, string>
        return OPENAI_TRANSLATE_OK as Response
      })
      .mockResolvedValueOnce(CONVERSATIONS_CREATE_OK)
      .mockResolvedValueOnce(CHAT_POST_OK)

    await handler(makeMessageEvent('C001'), {} as never, vi.fn())

    expect(capturedHeaders?.['Authorization']).toBe('Bearer test-api-key')
  })

  it('logs channel and subscribed status for each incoming message', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    makeSupabaseMock()
    vi.mocked(fetch)
      .mockResolvedValueOnce(CONVERSATIONS_INFO_OK)
      .mockResolvedValueOnce(OPENAI_TRANSLATE_OK)
      .mockResolvedValueOnce(CONVERSATIONS_CREATE_OK)
      .mockResolvedValueOnce(CHAT_POST_OK)

    await handler(makeMessageEvent('C001'), {} as never, vi.fn())

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('channel'),
      'C001',
      expect.stringContaining('subscribed'),
      true,
    )
    consoleSpy.mockRestore()
  })
})

describe('slack-events handler — subscribed channel routing', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('SUPABASE_URL', 'https://db.example.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
    vi.stubEnv('OPEN_API_KEY', 'test-api-key')
  })

  it('ignores message from non-subscribed channel', async () => {
    makeSupabaseMock({
      subscription: { data: null, error: { code: 'PGRST116', message: 'no rows' } },
    })
    const result = await handler(makeMessageEvent('C999'), {} as never, vi.fn())

    expect(result?.statusCode).toBe(200)
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('translates and posts to mirror channel when mirror already exists', async () => {
    makeSupabaseMock()
    vi.mocked(fetch)
      .mockResolvedValueOnce(CONVERSATIONS_INFO_OK)      // conversations.info → channel name
      .mockResolvedValueOnce(OPENAI_TRANSLATE_OK)     // OpenAI → translated text
      .mockResolvedValueOnce(CONVERSATIONS_CREATE_OK)    // conversations.create → new mirror
      .mockResolvedValueOnce(CHAT_POST_OK)               // chat.postMessage

    const result = await handler(makeMessageEvent('C001', 'こんにちは'), {} as never, vi.fn())

    expect(result?.statusCode).toBe(200)
    const postCallArgs = vi.mocked(fetch).mock.calls[3]
    const postBody = JSON.parse((postCallArgs[1] as RequestInit).body as string)
    expect(postBody.channel).toBe('C_MIRROR')
    expect(postBody.text).toBe('Hello')
  })

  it('finds existing mirror channel when name_taken and posts', async () => {
    makeSupabaseMock()
    vi.mocked(fetch)
      .mockResolvedValueOnce(CONVERSATIONS_INFO_OK)             // conversations.info
      .mockResolvedValueOnce(OPENAI_TRANSLATE_OK)            // OpenAI
      .mockResolvedValueOnce(CONVERSATIONS_CREATE_NAME_TAKEN)   // create → name_taken
      .mockResolvedValueOnce(CONVERSATIONS_LIST_WITH_MIRROR)    // list → find existing
      .mockResolvedValueOnce(CHAT_POST_OK)                      // chat.postMessage

    const result = await handler(makeMessageEvent('C001', 'こんにちは'), {} as never, vi.fn())

    expect(result?.statusCode).toBe(200)
    const postCallArgs = vi.mocked(fetch).mock.calls[4]
    const postBody = JSON.parse((postCallArgs[1] as RequestInit).body as string)
    expect(postBody.channel).toBe('C_EXISTING')
    expect(postBody.text).toBe('Hello')
  })
})
