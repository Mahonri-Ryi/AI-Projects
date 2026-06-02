import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { resolveSleepStatus } from '../lib/nightWake'
import { TEST_CHILD_ID, activeNightWake, openNightSession, openNapSession } from '../test/fixtures'
import { ActionButtons } from './ActionButtons'

const handlers = () => ({
  onStartNap: vi.fn(),
  onStartBedtime: vi.fn(),
  onWakeUp: vi.fn(),
  onMorningWake: vi.fn(),
  onStartNightWake: vi.fn(),
  onEndNightWake: vi.fn(),
})

describe('ActionButtons', () => {
  it('starts nap and bedtime when awake', async () => {
    const user = userEvent.setup()
    const h = handlers()
    const status = resolveSleepStatus([], [], TEST_CHILD_ID)
    render(<ActionButtons status={status} {...h} />)

    await user.click(screen.getByRole('button', { name: /start nap/i }))
    await user.click(screen.getByRole('button', { name: /start bedtime/i }))
    expect(h.onStartNap).toHaveBeenCalledTimes(1)
    expect(h.onStartBedtime).toHaveBeenCalledTimes(1)
  })

  it('wakes from nap without morning label', async () => {
    const user = userEvent.setup()
    const h = handlers()
    const nap = openNapSession('2026-06-02T12:00:00.000Z')
    const status = resolveSleepStatus([nap], [], TEST_CHILD_ID)
    render(<ActionButtons status={status} {...h} />)

    await user.click(screen.getByRole('button', { name: /mark baby awake/i }))
    expect(h.onWakeUp).toHaveBeenCalledTimes(1)
    expect(h.onMorningWake).not.toHaveBeenCalled()
  })

  it('offers night wake and morning wake during open night sleep', async () => {
    const user = userEvent.setup()
    const h = handlers()
    const night = openNightSession('2026-06-01T22:00:00.000Z')
    const status = resolveSleepStatus([night], [], TEST_CHILD_ID)
    render(<ActionButtons status={status} {...h} />)

    await user.click(screen.getByRole('button', { name: /up for feed/i }))
    await user.click(screen.getByRole('button', { name: /morning wake up/i }))
    expect(h.onStartNightWake).toHaveBeenCalledTimes(1)
    expect(h.onMorningWake).toHaveBeenCalledTimes(1)
  })

  it('ends night wake or morning wake when baby is up overnight', async () => {
    const user = userEvent.setup()
    const h = handlers()
    const night = openNightSession('2026-06-01T22:00:00.000Z', 'night-1')
    const wake = activeNightWake('night-1', '2026-06-02T02:00:00.000Z')
    const status = resolveSleepStatus([night], [wake], TEST_CHILD_ID)
    render(<ActionButtons status={status} {...h} />)

    await user.click(screen.getByRole('button', { name: /baby back to sleep/i }))
    await user.click(screen.getByRole('button', { name: /morning wake up/i }))
    expect(h.onEndNightWake).toHaveBeenCalledTimes(1)
    expect(h.onMorningWake).toHaveBeenCalledTimes(1)
  })
})
