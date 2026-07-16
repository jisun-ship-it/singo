import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from './Settings'
import * as subscriptions from '../lib/subscriptions'

vi.mock('../lib/subscriptions')

const mockChannels = [
  { id: 'C001', name: 'client-jp', subscribed: false },
  { id: 'C002', name: 'general', subscribed: true },
]

describe('Settings — Slack integration', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '' },
      writable: true,
    })
    vi.mocked(subscriptions.fetchChannels).mockResolvedValue([])
  })

  it('renders a "Connect Slack" link', () => {
    render(<Settings />)
    expect(screen.getByRole('link', { name: /Connect Slack/i })).toBeInTheDocument()
  })

  it('Connect Slack link points to Slack OAuth URL', () => {
    render(<Settings />)
    const link = screen.getByRole('link', { name: /Connect Slack/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('slack.com/oauth/v2/authorize'))
  })

  it('shows connected confirmation when ?connected=true', () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '?connected=true' },
      writable: true,
    })
    render(<Settings />)
    expect(screen.getByText(/Slack workspace connected/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Connect Slack/i })).not.toBeInTheDocument()
  })
})

describe('Settings — channel subscriptions', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '?connected=true' },
      writable: true,
    })
    vi.mocked(subscriptions.fetchChannels).mockResolvedValue(mockChannels)
    vi.mocked(subscriptions.setSubscription).mockResolvedValue(undefined)
  })

  it('shows Channel Subscriptions section when connected', async () => {
    render(<Settings />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Channel Subscriptions' })).toBeInTheDocument(),
    )
  })

  it('lists channels with their subscription status', async () => {
    render(<Settings />)
    await waitFor(() => screen.getByText('#client-jp'))
    expect(screen.getByText('#client-jp')).toBeInTheDocument()
    expect(screen.getByText('#general')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unsubscribe' })).toBeInTheDocument()
  })

  it('calls setSubscription with subscribed=true when Subscribe is clicked', async () => {
    const user = userEvent.setup()
    render(<Settings />)
    await waitFor(() => screen.getByRole('button', { name: 'Subscribe' }))
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(subscriptions.setSubscription).toHaveBeenCalledWith('C001', true)
  })

  it('calls setSubscription with subscribed=false when Unsubscribe is clicked', async () => {
    const user = userEvent.setup()
    render(<Settings />)
    await waitFor(() => screen.getByRole('button', { name: 'Unsubscribe' }))
    await user.click(screen.getByRole('button', { name: 'Unsubscribe' }))
    expect(subscriptions.setSubscription).toHaveBeenCalledWith('C002', false)
  })

  it('shows error message when channel fetch fails', async () => {
    vi.mocked(subscriptions.fetchChannels).mockRejectedValue(new Error('Network error'))
    render(<Settings />)
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('채널 목록을 불러오지 못했습니다'),
    )
  })

  it('does not show Channel Subscriptions section when not connected', () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '' },
      writable: true,
    })
    render(<Settings />)
    expect(screen.queryByRole('heading', { name: 'Channel Subscriptions' })).not.toBeInTheDocument()
  })
})
