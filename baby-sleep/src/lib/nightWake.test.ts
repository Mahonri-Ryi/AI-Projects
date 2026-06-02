import { describe, expect, it } from 'vitest'
import { parseISO } from 'date-fns'
import {
  getNightWakeStats,
  getTypicalResettleMinutes,
  isNightHours,
  resolveSleepStatus,
  shouldSuppressNapGuidance,
} from './nightWake'
import type { NightWake, SleepSession } from '../types'

const childId = 'c1'

describe('nightWake', () => {
  it('detects night hours', () => {
    expect(isNightHours(new Date(2026, 4, 31, 22, 0))).toBe(true)
    expect(isNightHours(new Date(2026, 4, 31, 10, 0))).toBe(false)
  })

  it('treats active night wake as awake with open night session', () => {
    const night: SleepSession = {
      id: 'n1',
      childId,
      kind: 'night',
      start: '2026-05-31T19:00:00.000Z',
      end: null,
    }
    const wake: NightWake = {
      id: 'w1',
      childId,
      nightSessionId: 'n1',
      start: '2026-05-31T02:00:00.000Z',
      end: null,
    }
    const status = resolveSleepStatus([night], [wake], childId)
    expect(status.isAsleep).toBe(false)
    expect(status.activeNightWake?.id).toBe('w1')
    expect(status.openNightSession?.id).toBe('n1')
  })

  it('computes typical resettle from history', () => {
    const wakes: NightWake[] = [
      {
        id: '1',
        childId,
        nightSessionId: 'n',
        start: '2026-05-01T02:00:00.000Z',
        end: '2026-05-01T02:20:00.000Z',
      },
      {
        id: '2',
        childId,
        nightSessionId: 'n',
        start: '2026-05-02T02:00:00.000Z',
        end: '2026-05-02T02:30:00.000Z',
      },
    ]
    expect(getTypicalResettleMinutes(wakes, childId, parseISO('2026-05-10'))).toBe(25)
  })

  it('suppresses nap guidance during night wake', () => {
    const night: SleepSession = {
      id: 'n1',
      childId,
      kind: 'night',
      start: '2026-05-31T19:00:00.000Z',
      end: null,
    }
    const wake: NightWake = {
      id: 'w1',
      childId,
      nightSessionId: 'n1',
      start: '2026-05-31T02:00:00.000Z',
      end: null,
    }
    const status = resolveSleepStatus([night], [wake], childId)
    expect(shouldSuppressNapGuidance(status)).toBe(true)
  })

  it('stats include current wake duration', () => {
    const night: SleepSession = {
      id: 'n1',
      childId,
      kind: 'night',
      start: new Date(Date.now() - 4 * 3600_000).toISOString(),
      end: null,
    }
    const wake: NightWake = {
      id: 'w1',
      childId,
      nightSessionId: 'n1',
      start: new Date(Date.now() - 15 * 60_000).toISOString(),
      end: null,
    }
    const stats = getNightWakeStats([night], [wake], childId)
    expect(stats?.currentWakeMinutes).toBeGreaterThanOrEqual(14)
    expect(stats?.wakesTonight).toBe(1)
  })
})
