import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Settings } from './Settings'

describe('Settings', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '' },
      writable: true,
    })
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
