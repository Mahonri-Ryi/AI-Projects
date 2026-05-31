import { addMinutes } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { FIXED_NOW } from '../test/fixtures'
import { getSources, SOURCES_WAKE_WINDOWS, SOURCES_BEDTIME } from '../data/researchCatalog'
import { buildDueReminders, remindersToFire } from './reminders'
import type { NextBedtimePrediction, NextNapPrediction } from '../types'

function napPrediction(sweet: Date): NextNapPrediction {
  return {
    sweetSpot: sweet,
    windowStart: addMinutes(sweet, -30),
    windowEnd: addMinutes(sweet, 30),
    targetWakeMinutes: 90,
    explanation: 'test',
    sources: getSources(SOURCES_WAKE_WINDOWS),
  }
}

function bedPrediction(sweet: Date): NextBedtimePrediction {
  return {
    sweetSpot: sweet,
    windowStart: addMinutes(sweet, -45),
    windowEnd: addMinutes(sweet, 30),
    explanation: 'test',
    sources: getSources(SOURCES_BEDTIME),
    learnedFromHistory: false,
    flexibleSchedule: false,
  }
}

describe('buildDueReminders', () => {
  it('returns empty when disabled', () => {
    const due = buildDueReminders(
      'Luna',
      napPrediction(addMinutes(FIXED_NOW, 60)),
      bedPrediction(addMinutes(FIXED_NOW, 300)),
      { enabled: false, napMinutesBefore: 10, bedtimeMinutesBefore: 15 },
      FIXED_NOW,
    )
    expect(due).toHaveLength(0)
  })

  it('schedules nap and bedtime reminders', () => {
    const due = buildDueReminders(
      'Luna',
      napPrediction(addMinutes(FIXED_NOW, 60)),
      bedPrediction(addMinutes(FIXED_NOW, 300)),
      { enabled: true, napMinutesBefore: 10, bedtimeMinutesBefore: 15 },
      FIXED_NOW,
    )
    expect(due).toHaveLength(2)
    expect(due.map((d) => d.kind)).toEqual(['nap', 'bedtime'])
  })
})

describe('remindersToFire', () => {
  it('fires when within one minute of scheduled time', () => {
    const fireAt = addMinutes(FIXED_NOW, -0.5)
    const due = [
      {
        kind: 'nap' as const,
        fireAt,
        title: 't',
        body: 'b',
      },
    ]
    const fired = new Set<string>()
    const now = FIXED_NOW
    const batch = remindersToFire(due, now, fired)
    expect(batch).toHaveLength(1)
  })
})
