import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Landing } from './Landing'

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: { origin: 'https://test.example.com', search: '' },
    writable: true,
  })
})

describe('Landing — Hero section', () => {
  it('renders Hero headline', () => {
    render(<Landing />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Understand every Slack conversation in your language/i,
      }),
    ).toBeInTheDocument()
  })

  it('Connect Slack CTA links to Slack OAuth URL', () => {
    render(<Landing />)
    const link = screen.getByRole('link', { name: /Connect Slack/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('slack.com/oauth/v2/authorize'))
  })
})

describe('Landing — 3-step section', () => {
  it('renders all 3 step headings', () => {
    render(<Landing />)
    expect(screen.getByRole('heading', { name: 'Connect Slack' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Choose channels' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Receive mirror channels' })).toBeInTheDocument()
  })
})
