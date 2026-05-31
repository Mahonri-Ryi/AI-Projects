import { describe, expect, it } from 'vitest'
import { getLoggingStreak } from './streaks'
import type { SleepSession } from '../types'

describe('getLoggingStreak', () => {
  const now = new Date('2026-05-31T12:00:00')

  it('counts consecutive days with logs', () => {
    const sessions: SleepSession[] = [
      {
        id: '1',
        childId: 'c',
        kind: 'nap',
        start: '2026-05-31T10:00:00.000Z',
        end: '2026-05-31T11:00:00.000Z',
      },
      {
        id: '2',
        childId: 'c',
        kind: 'nap',
        start: '2026-05-30T10:00:00.000Z',
        end: '2026-05-30T11:00:00.000Z',
      },
    ]
    const streak = getLoggingStreak(sessions, now)
    expect(streak.currentDays).toBeGreaterThanOrEqual(2)
    expect(streak.message).toMatch(/days in a row/)
  })
})
