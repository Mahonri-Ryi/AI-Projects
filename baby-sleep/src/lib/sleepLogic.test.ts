import { addMinutes } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { CHILD_A, FIXED_NOW, session } from '../test/fixtures'
import {
  formatDuration,
  getSleepStatus,
  predictNextNap,
} from './sleepLogic'

describe('getSleepStatus', () => {
  it('returns asleep when a session has no end', () => {
    const sessions = [
      session({
        id: '1',
        childId: CHILD_A.id,
        kind: 'nap',
        start: FIXED_NOW.toISOString(),
        end: null,
      }),
    ]
    const status = getSleepStatus(sessions)
    expect(status.isAsleep).toBe(true)
    expect(status.currentSession?.id).toBe('1')
    expect(status.awakeSince).toBeNull()
  })

  it('returns awake with awakeSince from last ended session', () => {
    const wakeTime = addMinutes(FIXED_NOW, -45)
    const sessions = [
      session({
        id: '1',
        childId: CHILD_A.id,
        kind: 'nap',
        start: addMinutes(wakeTime, -60).toISOString(),
        end: wakeTime.toISOString(),
      }),
    ]
    const status = getSleepStatus(sessions)
    expect(status.isAsleep).toBe(false)
    expect(status.awakeSince?.getTime()).toBe(wakeTime.getTime())
  })

  it('returns awake with no awakeSince when no sessions', () => {
    const status = getSleepStatus([])
    expect(status.isAsleep).toBe(false)
    expect(status.awakeSince).toBeNull()
  })
})

describe('predictNextNap', () => {
  const birthDate = CHILD_A.birthDate

  it('returns null while baby is asleep', () => {
    const sessions = [
      session({
        id: '1',
        childId: CHILD_A.id,
        kind: 'nap',
        start: FIXED_NOW.toISOString(),
        end: null,
      }),
    ]
    expect(predictNextNap(birthDate, sessions, FIXED_NOW)).toBeNull()
  })

  it('returns null when there is no wake time', () => {
    expect(predictNextNap(birthDate, [], FIXED_NOW)).toBeNull()
  })

  it('returns nap window when awake', () => {
    const awakeSince = addMinutes(FIXED_NOW, -60)
    const sessions = [
      session({
        id: '1',
        childId: CHILD_A.id,
        kind: 'nap',
        start: addMinutes(awakeSince, -90).toISOString(),
        end: awakeSince.toISOString(),
      }),
    ]
    const prediction = predictNextNap(birthDate, sessions, FIXED_NOW)
    expect(prediction).not.toBeNull()
    expect(prediction!.sweetSpot.getTime()).toBeGreaterThan(awakeSince.getTime())
    expect(prediction!.windowEnd.getTime()).toBeGreaterThan(prediction!.windowStart.getTime())
    expect(prediction!.targetWakeMinutes).toBeGreaterThan(0)
  })

  it('includes research sources on predictions', () => {
    const awakeSince = addMinutes(FIXED_NOW, -30)
    const sessions = [
      session({
        id: '1',
        childId: CHILD_A.id,
        kind: 'nap',
        start: addMinutes(awakeSince, -40).toISOString(),
        end: awakeSince.toISOString(),
      }),
    ]
    const prediction = predictNextNap(birthDate, sessions, FIXED_NOW)!
    expect(prediction.sources.length).toBeGreaterThan(0)
    expect(prediction.sources.every((s) => s.url.startsWith('https://'))).toBe(true)
  })

  it('shortens wake window after a very short nap', () => {
    const awakeSince = FIXED_NOW
    const sessions = [
      session({
        id: '1',
        childId: CHILD_A.id,
        kind: 'nap',
        start: addMinutes(awakeSince, -20).toISOString(),
        end: awakeSince.toISOString(),
      }),
    ]
    const prediction = predictNextNap(birthDate, sessions, FIXED_NOW)!
    expect(prediction.adjustmentNote).toMatch(/short/i)
    expect(prediction.adjustmentSources?.length).toBeGreaterThan(0)
  })
})

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(45)).toBe('45m')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m')
  })

  it('formats whole hours', () => {
    expect(formatDuration(120)).toBe('2h')
  })
})
