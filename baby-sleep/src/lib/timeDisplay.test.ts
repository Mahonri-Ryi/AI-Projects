import { describe, expect, it } from 'vitest'
import { formatDurationWords, formatInUntilWithTime, formatMinutesUntilWithTime } from './timeDisplay'

describe('formatDurationWords', () => {
  it('formats minutes only', () => {
    expect(formatDurationWords(45)).toBe('45 min')
    expect(formatDurationWords(1)).toBe('1 min')
  })

  it('formats hours and minutes', () => {
    expect(formatDurationWords(90)).toBe('1 hr 30 min')
    expect(formatDurationWords(239)).toBe('3 hr 59 min')
  })

  it('formats hours only', () => {
    expect(formatDurationWords(120)).toBe('2 hr')
  })
})

describe('formatMinutesUntilWithTime', () => {
  it('includes clock time', () => {
    const target = new Date(2026, 4, 31, 11, 31)
    expect(formatMinutesUntilWithTime(91, target)).toBe('~1 hr 31 min · 11:31 AM')
  })
})

describe('formatInUntilWithTime', () => {
  it('prefixes with in', () => {
    const target = new Date(2026, 4, 31, 11, 31)
    expect(formatInUntilWithTime(91, target)).toBe('in ~1 hr 31 min · 11:31 AM')
  })
})
