import { describe, expect, it } from 'vitest'
import { getGlanceSummary } from './glance'

describe('getGlanceSummary', () => {
  it('asks for profile when needed', () => {
    const g = getGlanceSummary(
      {
        isAsleep: false,
        currentSession: null,
        lastEndedSession: null,
        awakeSince: null,
        asleepSince: null,
        openNightSession: null,
        activeNightWake: null,
      },
      null,
      null,
      true,
    )
    expect(g.kind).toBe('profile')
  })
})
