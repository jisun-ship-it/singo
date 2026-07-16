import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

vi.mock('./pages/Settings', () => ({ Settings: () => <div>Settings page</div> }))
vi.mock('./pages/Landing', () => ({ Landing: () => <div>Landing page</div> }))

describe('App — routing', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '' },
      writable: true,
    })
  })

  it('renders Landing when not connected', () => {
    render(<App />)
    expect(screen.getByText('Landing page')).toBeInTheDocument()
    expect(screen.queryByText('Settings page')).not.toBeInTheDocument()
  })

  it('renders Settings when connected=true', () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://test.example.com', search: '?connected=true' },
      writable: true,
    })
    render(<App />)
    expect(screen.getByText('Settings page')).toBeInTheDocument()
    expect(screen.queryByText('Landing page')).not.toBeInTheDocument()
  })
})
