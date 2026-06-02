import { describe, expect, it } from 'vitest'
import { defaultMinTimeForLog } from '../lib/logTimePrompt'

describe('defaultMinTimeForLog', () => {
  const now = new Date('2026-06-02T12:00:00')

  it('allows 3 days back for sleep starts', () => {
    const min = defaultMinTimeForLog('start-nap', now)
    expect(min.getTime()).toBeLessThan(now.getTime())
    expect(now.getTime() - min.getTime()).toBeGreaterThan(2 * 24 * 60 * 60_000)
  })
})
