import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from './Settings'
import * as subscriptions from '../lib/subscriptions'

vi.mock('../lib/subscriptions')

const mockWorkspace = { name: 'Test Workspace', teamId: 'T123' }
const mockChannels = [
  { id: 'C001', name: 'client-jp', subscribed: false, target_language: null, is_private: false, num_members: 5 },
  { id: 'C002', name: 'general', subscribed: true, target_language: null, is_private: true, num_members: 42 },
]
const mockResponse = { workspace: mockWorkspace, channels: mockChannels }

describe('Settings — Slack integration', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '' },
      writable: true,
    })
    vi.mocked(subscriptions.fetchChannels).mockResolvedValue(
      { workspace: mockWorkspace, channels: [] },
    )
  })

  it('renders a "Connect Slack" link when not connected', () => {
    render(<Settings />)
    expect(screen.getByRole('link', { name: /Connect Slack/i })).toBeInTheDocument()
  })

  it('Connect Slack link points to Slack OAuth URL', () => {
    render(<Settings />)
    const link = screen.getByRole('link', { name: /Connect Slack/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('slack.com/oauth/v2/authorize'))
  })

  it('hides Slack Integration section and Connect Slack link when connected', () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '?connected=true' },
      writable: true,
    })
    render(<Settings />)
    expect(screen.queryByRole('link', { name: /Connect Slack/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/Slack workspace connected/i)).not.toBeInTheDocument()
  })
})

describe('Settings — header', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '?connected=true' },
      writable: true,
    })
    vi.mocked(subscriptions.fetchChannels).mockResolvedValue(mockResponse)
  })

  it('renders Singo wordmark in header', () => {
    render(<Settings />)
    expect(within(screen.getByRole('banner')).getByText('Singo')).toBeInTheDocument()
  })

  it('shows workspace name in header after channels load', async () => {
    render(<Settings />)
    await waitFor(() =>
      expect(within(screen.getByRole('banner')).getByText('Test Workspace')).toBeInTheDocument(),
    )
  })
})

describe('Settings — channel subscriptions', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '?connected=true' },
      writable: true,
    })
    vi.mocked(subscriptions.fetchChannels).mockResolvedValue(mockResponse)
    vi.mocked(subscriptions.setSubscription).mockResolvedValue(undefined)
  })

  it('shows "Your channels" heading and description when connected', async () => {
    render(<Settings />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Your channels' })).toBeInTheDocument(),
    )
    expect(
      screen.getByText('Subscribe to any channel and choose the language for its live mirror.'),
    ).toBeInTheDocument()
  })

  it('shows Public badge for public channels and Private badge for private channels', async () => {
    render(<Settings />)
    await waitFor(() => screen.getByText('#client-jp'))
    expect(screen.getByText('Public')).toBeInTheDocument()
    expect(screen.getByText('Private')).toBeInTheDocument()
  })

  it('shows member count as secondary text under channel name', async () => {
    render(<Settings />)
    await waitFor(() => screen.getByText('#client-jp'))
    expect(screen.getByText('5 members')).toBeInTheDocument()
    expect(screen.getByText('42 members')).toBeInTheDocument()
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

  it('does not show Your channels section when not connected', () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '' },
      writable: true,
    })
    render(<Settings />)
    expect(screen.queryByRole('heading', { name: 'Your channels' })).not.toBeInTheDocument()
  })
})

describe('Settings — language selection', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '?connected=true' },
      writable: true,
    })
    vi.mocked(subscriptions.fetchChannels).mockResolvedValue({
      workspace: mockWorkspace,
      channels: [
        { id: 'C001', name: 'client-jp', subscribed: true, target_language: null, is_private: false, num_members: 3 },
        { id: 'C002', name: 'general', subscribed: false, target_language: null, is_private: false, num_members: 10 },
      ],
    })
    vi.mocked(subscriptions.setLanguage).mockResolvedValue(undefined)
  })

  it('shows language dropdown button only for subscribed channels', async () => {
    render(<Settings />)
    await waitFor(() => screen.getByText('#client-jp'))
    const langBtns = screen.getAllByRole('button', { name: /English|한국어|日本語/i })
    expect(langBtns).toHaveLength(1)
  })

  it('clicking language button opens option list', async () => {
    const user = userEvent.setup()
    render(<Settings />)
    await waitFor(() => screen.getByText('#client-jp'))
    await user.click(screen.getByRole('button', { name: /English/i }))
    expect(screen.getByRole('option', { name: '한국어' })).toBeInTheDocument()
  })

  it('calls setLanguage when option is selected', async () => {
    const user = userEvent.setup()
    render(<Settings />)
    await waitFor(() => screen.getByText('#client-jp'))
    await user.click(screen.getByRole('button', { name: /English/i }))
    await user.click(screen.getByRole('option', { name: '한국어' }))
    expect(subscriptions.setLanguage).toHaveBeenCalledWith('C001', 'Korean')
  })
})
