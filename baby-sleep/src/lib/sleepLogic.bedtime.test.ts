import { addMinutes, setHours, setMinutes, startOfDay } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { CHILD_A, FIXED_NOW, session } from '../test/fixtures'
import {
  medianNightStartMinutes,
  predictNextBedtime,
} from './sleepLogic'

describe('medianNightStartMinutes', () => {
  it('returns null with fewer than two night logs', () => {
    const sessions = [
      session({
        id: '1',
        childId: CHILD_A.id,
        kind: 'night',
        start: setMinutes(setHours(startOfDay(FIXED_NOW), 19), 30).toISOString(),
        end: addMinutes(FIXED_NOW, -6 * 60).toISOString(),
      }),
    ]
    expect(medianNightStartMinutes(sessions, FIXED_NOW)).toBeNull()
  })

  it('returns median minute-of-day from night starts', () => {
    const day = startOfDay(FIXED_NOW)
    const sessions = [
      session({
        id: '1',
        childId: CHILD_A.id,
        kind: 'night',
        start: setMinutes(setHours(day, 19), 0).toISOString(),
        end: addMinutes(day, 8 * 60).toISOString(),
      }),
      session({
        id: '2',
        childId: CHILD_A.id,
        kind: 'night',
        start: setMinutes(setHours(addMinutes(day, -24 * 60), 19), 30).toISOString(),
        end: addMinutes(day, -12 * 60).toISOString(),
      }),
    ]
    expect(medianNightStartMinutes(sessions, FIXED_NOW)).toBe(19 * 60 + 30)
  })
})

describe('predictNextBedtime', () => {
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
    expect(predictNextBedtime(birthDate, sessions, FIXED_NOW)).toBeNull()
  })

  it('returns null when evening bedtime already logged today', () => {
    const awakeSince = addMinutes(FIXED_NOW, -30)
    const sessions = [
      session({
        id: '1',
        childId: CHILD_A.id,
        kind: 'night',
        start: setMinutes(setHours(startOfDay(FIXED_NOW), 19), 0).toISOString(),
        end: setMinutes(setHours(startOfDay(FIXED_NOW), 7), 0).toISOString(),
      }),
      session({
        id: '2',
        childId: CHILD_A.id,
        kind: 'nap',
        start: addMinutes(awakeSince, -60).toISOString(),
        end: awakeSince.toISOString(),
      }),
    ]
    expect(predictNextBedtime(birthDate, sessions, FIXED_NOW)).toBeNull()
  })

  it('still predicts after early-morning night sleep', () => {
    const awakeSince = addMinutes(FIXED_NOW, -60)
    const sessions = [
      session({
        id: '1',
        childId: CHILD_A.id,
        kind: 'night',
        start: setMinutes(setHours(startOfDay(FIXED_NOW), 2), 0).toISOString(),
        end: setMinutes(setHours(startOfDay(FIXED_NOW), 7), 0).toISOString(),
      }),
      session({
        id: '2',
        childId: CHILD_A.id,
        kind: 'nap',
        start: addMinutes(awakeSince, -45).toISOString(),
        end: awakeSince.toISOString(),
      }),
    ]
    expect(predictNextBedtime(birthDate, sessions, FIXED_NOW)).not.toBeNull()
  })

  it('returns bedtime window when awake', () => {
    const awakeSince = addMinutes(FIXED_NOW, -90)
    const sessions = [
      session({
        id: '1',
        childId: CHILD_A.id,
        kind: 'nap',
        start: addMinutes(awakeSince, -45).toISOString(),
        end: awakeSince.toISOString(),
      }),
    ]
    const prediction = predictNextBedtime(birthDate, sessions, FIXED_NOW)
    expect(prediction).not.toBeNull()
    expect(prediction!.sweetSpot.getTime()).toBeGreaterThan(FIXED_NOW.getTime())
    expect(prediction!.windowEnd.getTime()).toBeGreaterThan(prediction!.windowStart.getTime())
    expect(prediction!.sources.length).toBeGreaterThan(0)
  })

  it('uses history when enough night logs exist', () => {
    const day = startOfDay(FIXED_NOW)
    const awakeSince = addMinutes(FIXED_NOW, -60)
    const sessions = [
      session({
        id: 'n1',
        childId: CHILD_A.id,
        kind: 'night',
        start: setMinutes(setHours(addMinutes(day, -24 * 60), 20), 15).toISOString(),
        end: addMinutes(day, -14 * 60).toISOString(),
      }),
      session({
        id: 'n2',
        childId: CHILD_A.id,
        kind: 'night',
        start: setMinutes(setHours(addMinutes(day, -48 * 60), 20), 0).toISOString(),
        end: addMinutes(addMinutes(day, -24 * 60), -10 * 60).toISOString(),
      }),
      session({
        id: 'nap',
        childId: CHILD_A.id,
        kind: 'nap',
        start: addMinutes(awakeSince, -40).toISOString(),
        end: awakeSince.toISOString(),
      }),
    ]
    const prediction = predictNextBedtime(birthDate, sessions, FIXED_NOW)!
    expect(prediction.learnedFromHistory).toBe(true)
    expect(prediction.sweetSpot.getHours()).toBeGreaterThanOrEqual(19)
  })
})
