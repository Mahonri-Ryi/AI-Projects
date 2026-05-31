import { describe, expect, it } from 'vitest'
import { CHILD_A, FIXED_NOW, makeSampleSessions, session } from '../test/fixtures'
import {
  formatHours,
  generateInsights,
  getDailySummaries,
  getDayTimeline,
  getPeriodStats,
  getTodayStats,
} from './analytics'

describe('getDailySummaries', () => {
  it('returns one entry per day in range', () => {
    const summaries = getDailySummaries(makeSampleSessions(CHILD_A.id), 7, FIXED_NOW)
    expect(summaries).toHaveLength(7)
  })

  it('aggregates nap and night minutes', () => {
    const summaries = getDailySummaries(makeSampleSessions(CHILD_A.id), 1, FIXED_NOW)
    const today = summaries[0]
    expect(today.totalMinutes).toBeGreaterThan(0)
    expect(today.napCount).toBeGreaterThanOrEqual(1)
  })
})

describe('getPeriodStats', () => {
  it('computes averages when data exists', () => {
    const summaries = getDailySummaries(makeSampleSessions(CHILD_A.id), 7, FIXED_NOW)
    const stats = getPeriodStats(summaries)
    expect(stats.daysWithData).toBeGreaterThan(0)
    expect(stats.avgTotalHours).toBeGreaterThan(0)
  })

  it('returns zeros when no data', () => {
    const summaries = getDailySummaries([], 7, FIXED_NOW)
    const stats = getPeriodStats(summaries)
    expect(stats.daysWithData).toBe(0)
    expect(stats.avgTotalHours).toBe(0)
  })
})

describe('getTodayStats', () => {
  it('returns targets from age guidelines', () => {
    const stats = getTodayStats(makeSampleSessions(CHILD_A.id), 12, 15, FIXED_NOW)
    expect(stats.targetMin).toBe(12 * 60)
    expect(stats.targetMax).toBe(15 * 60)
  })
})

describe('generateInsights', () => {
  it('includes research sources on each insight', () => {
    const summaries = getDailySummaries(makeSampleSessions(CHILD_A.id), 14, FIXED_NOW)
    const insights = generateInsights(summaries, 12, 15)
    expect(insights.length).toBeGreaterThan(0)
    for (const insight of insights) {
      expect(insight.sources.length).toBeGreaterThan(0)
      expect(insight.sources[0].url).toMatch(/^https:\/\//)
    }
  })

  it('prompts for more data when insufficient history', () => {
    const summaries = getDailySummaries(
      [
        session({
          id: 'only',
          childId: CHILD_A.id,
          kind: 'nap',
          start: FIXED_NOW.toISOString(),
          end: FIXED_NOW.toISOString(),
        }),
      ],
      1,
      FIXED_NOW,
    )
    const insights = generateInsights(summaries, 12, 15)
    expect(insights[0].id).toBe('more-data')
  })
})

describe('getDayTimeline', () => {
  it('returns blocks covering the day', () => {
    const blocks = getDayTimeline(makeSampleSessions(CHILD_A.id), FIXED_NOW, FIXED_NOW)
    expect(blocks.length).toBeGreaterThan(0)
    const kinds = new Set(blocks.map((b) => b.kind))
    expect(kinds.has('nap') || kinds.has('night') || kinds.has('awake')).toBe(true)
  })
})

describe('formatHours', () => {
  it('formats hours and minutes', () => {
    expect(formatHours(90)).toBe('1 hr 30 min')
  })
})
