import { describe, expect, it } from 'vitest'
import { subDays } from 'date-fns'
import { defaultMinTimeForLog } from './logTimePrompt'

describe('defaultMinTimeForLog', () => {
  const now = new Date('2026-06-02T12:00:00')

  it('allows 3 days back for nap and bedtime starts', () => {
    for (const kind of ['start-nap', 'start-bedtime'] as const) {
      const min = defaultMinTimeForLog(kind, now)
      expect(min.getTime()).toBe(subDays(now, 3).getTime())
    }
  })

  it('allows 1 day back for wake and night-wake kinds', () => {
    for (const kind of [
      'wake-nap',
      'wake-morning',
      'night-wake-start',
      'night-wake-end',
    ] as const) {
      const min = defaultMinTimeForLog(kind, now)
      expect(min.getTime()).toBe(subDays(now, 1).getTime())
    }
  })
})
