import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal(
      'crypto',
      {
        ...globalThis.crypto,
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2),
      },
    )
  })

  it('renders dashboard and navigation', () => {
    render(<App />)
    expect(screen.getByText('Little Dream')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /insights/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
  })

  it('navigates to settings', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /settings/i }))
    expect(screen.getByText('Children')).toBeInTheDocument()
    expect(screen.getByText(/family sync/i)).toBeInTheDocument()
  })

  it('navigates to insights', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /insights/i }))
    expect(screen.getByText(/sleep trends/i)).toBeInTheDocument()
  })
})
