import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchChannels, setSubscription } from './subscriptions'

describe('fetchChannels', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('returns channels from the API', async () => {
    const mockChannels = [{ id: 'C001', name: 'client-jp', subscribed: false }]
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockChannels,
    } as Response)

    const result = await fetchChannels()

    expect(result).toEqual(mockChannels)
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
