import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function seedOnboardedState() {
  const child = {
    id: 'child-test',
    name: 'Baby',
    birthDate: '2024-06-15',
    color: '#4f46e5',
  }
  localStorage.setItem(
    'little-dream-app-v2',
    JSON.stringify({
      version: 2,
      children: [child],
      activeChildId: child.id,
      sessions: [],
      householdCode: '',
      onboardingComplete: true,
      dayMarkers: [],
      syncMeta: { lastSyncedAt: null, lastSyncLabel: null, mergeCount: 0 },
    }),
  )
}

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
})
