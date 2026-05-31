import { describe, expect, it } from 'vitest'
import { formatAge, getAgeInMonths, getWakeWindowGuidance } from './sleepScience'

describe('getAgeInMonths', () => {
  it('computes months from birth date', () => {
    const birth = '2024-01-15'
    const asOf = new Date(2024, 5, 15) // June 15 2024
    expect(getAgeInMonths(birth, asOf)).toBe(5)
  })

  it('does not return negative months', () => {
    const birth = '2025-01-01'
    const asOf = new Date(2024, 0, 1)
    expect(getAgeInMonths(birth, asOf)).toBe(0)
  })
})

describe('formatAge', () => {
  it('formats months for infants', () => {
    expect(formatAge(5)).toBe('5 months')
    expect(formatAge(1)).toBe('1 month')
  })

  it('formats years', () => {
    expect(formatAge(24)).toBe('2 years')
  })
})

describe('getWakeWindowGuidance', () => {
  it('returns age-appropriate wake windows for a 6-month-old', () => {
    const guidance = getWakeWindowGuidance('2024-12-15', new Date(2025, 5, 15))
    expect(guidance.minMinutes).toBeGreaterThan(0)
    expect(guidance.maxMinutes).toBeGreaterThan(guidance.minMinutes)
    expect(guidance.targetMinutes).toBeGreaterThanOrEqual(guidance.minMinutes)
    expect(guidance.sources.length).toBeGreaterThan(0)
    expect(guidance.totalSleepHours.min).toBeLessThan(guidance.totalSleepHours.max)
  })

  it('includes sleepy cues', () => {
    const guidance = getWakeWindowGuidance('2024-06-15', new Date(2025, 0, 1))
    expect(guidance.sleepyCues.length).toBeGreaterThan(0)
  })
})
