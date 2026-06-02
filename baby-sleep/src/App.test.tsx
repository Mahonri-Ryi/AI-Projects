import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { openNapSession, openNightSession, seedOnboardedState } from './test/fixtures'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    seedOnboardedState()
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
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /coach/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /insights/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
  })

  it('navigates to settings', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /settings/i }))
    expect(screen.getByText('Children')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /family sync/i })).toBeInTheDocument()
  })

  it('navigates to insights', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /insights/i }))
    expect(screen.getByText(/sleep trends/i)).toBeInTheDocument()
  })

  it('shows time prompt when starting a nap and logs on Use now', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /start nap/i }))
    expect(screen.getByRole('heading', { name: /when did the nap start/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /start nap/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /use now/i }))
    expect(screen.queryByRole('heading', { name: /when did the nap start/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark baby awake/i })).toBeInTheDocument()

    const raw = localStorage.getItem('little-dream-app-v2')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!) as { sessions: { kind: string; end: string | null }[] }
    expect(parsed.sessions.some((s) => s.kind === 'nap' && s.end === null)).toBe(true)
  })

  it('shows bedtime time prompt and can cancel back to actions', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /start bedtime/i }))
    const prompt = screen.getByRole('heading', { name: /when did bedtime start/i })
    expect(prompt).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(prompt).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start bedtime/i })).toBeInTheDocument()
  })

  it('shows wake prompt for open nap and completes wake flow', async () => {
    seedOnboardedState({ sessions: [openNapSession('2026-06-02T10:00:00.000Z')] })
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /mark baby awake/i }))
    expect(screen.getByRole('heading', { name: /when did she wake up/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /use now/i }))
    expect(screen.getByText(/optional: feeding before this sleep/i)).toBeInTheDocument()
  })

  it('shows night wake time prompt during bedtime', async () => {
    seedOnboardedState({ sessions: [openNightSession('2026-06-01T20:00:00.000Z')] })
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /up for feed/i }))
    const prompt = screen.getByRole('heading', { name: /when did she wake up/i })
    expect(prompt).toBeInTheDocument()
    const card = prompt.closest('.card') ?? prompt.parentElement!
    await user.click(within(card as HTMLElement).getByRole('button', { name: /use now/i }))
    expect(screen.getByRole('button', { name: /back to sleep/i })).toBeInTheDocument()
  })
})
