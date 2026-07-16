import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchChannels, setSubscription, setLanguage } from './subscriptions'

describe('fetchChannels', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('returns workspace and channels from the API', async () => {
    const mockData = {
      workspace: { name: 'Test WS', teamId: 'T123' },
      channels: [{ id: 'C001', name: 'client-jp', subscribed: false, target_language: null, is_private: false }],
    }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response)

    const result = await fetchChannels()

    expect(result).toEqual(mockData)
  })

  it('throws when the API responds with an error status', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)

    await expect(fetchChannels()).rejects.toThrow('Failed to fetch channels')
  })
})

describe('setSubscription', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('POSTs channelId and subscribed flag to the API', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)

    await setSubscription('C001', true)

    expect(fetch).toHaveBeenCalledWith('/.netlify/functions/slack-channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: 'C001', subscribed: true }),
    })
  })

  it('throws when the subscription update fails', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)

    await expect(setSubscription('C001', true)).rejects.toThrow('Failed to update subscription')
  })
})

describe('setLanguage', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('POSTs channelId and targetLanguage to the API', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)

    await setLanguage('C001', 'Korean')

    expect(fetch).toHaveBeenCalledWith('/.netlify/functions/slack-channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: 'C001', targetLanguage: 'Korean' }),
    })
  })

  it('throws when the language update fails', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)

    await expect(setLanguage('C001', 'Korean')).rejects.toThrow('Failed to update language')
  })
})
