import {
  differenceInMinutes,
  eachDayOfInterval,
  endOfDay,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns'
import {
  getSources,
  SOURCES_CIRCADIAN,
  SOURCES_NAP_FREQUENCY,
  SOURCES_TOTAL_SLEEP,
} from '../data/researchCatalog'
import type { PatternInsight, SleepSession } from '../types'

export interface DaySleepSummary {
  date: string // yyyy-MM-dd
  label: string // Mon, Tue
  totalMinutes: number
  napMinutes: number
  nightMinutes: number
  napCount: number
  avgNapMinutes: number
  longestStretchMinutes: number
}

export interface PeriodStats {
  avgTotalHours: number
  avgNapCount: number
  avgNapMinutes: number
  daysWithData: number
  trendPercent: number | null // vs prior period
}

export interface TodayStats {
  totalMinutes: number
  napMinutes: number
  nightMinutes: number
  napCount: number
  targetMin: number
  targetMax: number
}

function sessionsForDay(sessions: SleepSession[], day: Date, now: Date): SleepSession[] {
  return sessions.filter((s) => {
    const start = parseISO(s.start)
    const end = s.end ? parseISO(s.end) : now
    return (
      isSameDay(start, day) ||
      isSameDay(end, day) ||
      (start < startOfDay(day) && end > endOfDay(day))
    )
  })
}

function minutesOnDay(s: SleepSession, day: Date, now: Date): number {
  const dayStart = startOfDay(day)
  const dayEnd = endOfDay(day)
  const start = parseISO(s.start)
  const end = s.end ? parseISO(s.end) : now
  const clipStart = start < dayStart ? dayStart : start
  const clipEnd = end > dayEnd ? dayEnd : end
  if (clipEnd <= clipStart) return 0
  return differenceInMinutes(clipEnd, clipStart)
}

export function getDailySummaries(
  sessions: SleepSession[],
  days: number,
  now = new Date(),
): DaySleepSummary[] {
  const end = startOfDay(now)
  const start = subDays(end, days - 1)
  const range = eachDayOfInterval({ start, end })

  return range.map((day) => {
    const daySessions = sessionsForDay(sessions, day, now)
    let napMinutes = 0
    let nightMinutes = 0
    let napCount = 0
    let longest = 0

    for (const s of daySessions) {
      const mins = minutesOnDay(s, day, now)
      if (s.kind === 'nap') {
        napMinutes += mins
        if (mins > 0) napCount += 1
      } else {
        nightMinutes += mins
      }
      longest = Math.max(longest, mins)
    }

    const totalMinutes = napMinutes + nightMinutes
    return {
      date: format(day, 'yyyy-MM-dd'),
      label: format(day, 'EEE'),
      totalMinutes,
      napMinutes,
      nightMinutes,
      napCount,
      avgNapMinutes: napCount > 0 ? Math.round(napMinutes / napCount) : 0,
      longestStretchMinutes: longest,
    }
  })
}

export function getPeriodStats(summaries: DaySleepSummary[]): PeriodStats {
  const withData = summaries.filter((d) => d.totalMinutes > 0)
  if (withData.length === 0) {
    return {
      avgTotalHours: 0,
      avgNapCount: 0,
      avgNapMinutes: 0,
      daysWithData: 0,
      trendPercent: null,
    }
  }

  const avgTotal =
    withData.reduce((s, d) => s + d.totalMinutes, 0) / withData.length / 60
  const avgNaps = withData.reduce((s, d) => s + d.napCount, 0) / withData.length
  const napDays = withData.filter((d) => d.napCount > 0)
  const avgNapMin =
    napDays.length > 0
      ? napDays.reduce((s, d) => s + d.avgNapMinutes, 0) / napDays.length
      : 0

  const mid = Math.floor(summaries.length / 2)
  const firstHalf = summaries.slice(0, mid).filter((d) => d.totalMinutes > 0)
  const secondHalf = summaries.slice(mid).filter((d) => d.totalMinutes > 0)
  let trendPercent: number | null = null
  if (firstHalf.length > 0 && secondHalf.length > 0) {
    const a =
      firstHalf.reduce((s, d) => s + d.totalMinutes, 0) / firstHalf.length
    const b =
      secondHalf.reduce((s, d) => s + d.totalMinutes, 0) / secondHalf.length
    if (a > 0) trendPercent = Math.round(((b - a) / a) * 100)
  }

  return {
    avgTotalHours: Math.round(avgTotal * 10) / 10,
    avgNapCount: Math.round(avgNaps * 10) / 10,
    avgNapMinutes: Math.round(avgNapMin),
    daysWithData: withData.length,
    trendPercent,
  }
}

export function getTodayStats(
  sessions: SleepSession[],
  targetMinHours: number,
  targetMaxHours: number,
  now = new Date(),
): TodayStats {
  const today = getDailySummaries(sessions, 1, now)[0]
  return {
    totalMinutes: today.totalMinutes,
    napMinutes: today.napMinutes,
    nightMinutes: today.nightMinutes,
    napCount: today.napCount,
    targetMin: targetMinHours * 60,
    targetMax: targetMaxHours * 60,
  }
}

export function generateInsights(
  summaries: DaySleepSummary[],
  targetMinHours: number,
  targetMaxHours: number,
): PatternInsight[] {
  const insights: PatternInsight[] = []
  const withData = summaries.filter((d) => d.totalMinutes > 0)
  if (withData.length < 2) {
    insights.push({
      id: 'more-data',
      type: 'tip',
      title: 'Building your sleep profile',
      body: 'Log naps and bedtime for a few more days to unlock trend analysis and pattern detection.',
      sources: getSources(SOURCES_TOTAL_SLEEP),
    })
    return insights
  }

  const stats = getPeriodStats(summaries)

  if (stats.avgTotalHours >= targetMinHours && stats.avgTotalHours <= targetMaxHours) {
    insights.push({
      id: 'in-range',
      type: 'positive',
      title: 'Sleep within age guidelines',
      body: `Average ${stats.avgTotalHours}h per day over the last ${withData.length} logged days — within the typical ${targetMinHours}–${targetMaxHours}h range for this age.`,
      sources: getSources(SOURCES_TOTAL_SLEEP),
    })
  } else if (stats.avgTotalHours < targetMinHours) {
    insights.push({
      id: 'below',
      type: 'tip',
      title: 'Total sleep below typical range',
      body: `Averaging ${stats.avgTotalHours}h vs. ${targetMinHours}–${targetMaxHours}h typical. Consider earlier bedtimes or an extra nap; discuss with your pediatrician if concerned.`,
      sources: getSources(SOURCES_TOTAL_SLEEP),
    })
  } else {
    insights.push({
      id: 'above',
      type: 'neutral',
      title: 'Higher total sleep than average',
      body: `Averaging ${stats.avgTotalHours}h — above the mid-range for age. Individual variation is normal; watch daytime mood and feeding.`,
      sources: getSources(SOURCES_TOTAL_SLEEP),
    })
  }

  const napHeavy = withData.filter((d) => d.napCount >= 3)
  if (napHeavy.length >= withData.length * 0.5) {
    insights.push({
      id: 'frequent-naps',
      type: 'neutral',
      title: 'Frequent daytime naps',
      body: `Most days include 3+ naps — common in younger infants. Wake windows may shorten as total nap time increases.`,
      sources: getSources(SOURCES_NAP_FREQUENCY),
    })
  }

  const bestDay = [...withData].sort((a, b) => b.totalMinutes - a.totalMinutes)[0]
  const worstDay = [...withData].sort((a, b) => a.totalMinutes - b.totalMinutes)[0]
  if (bestDay.totalMinutes - worstDay.totalMinutes > 120) {
    insights.push({
      id: 'variance',
      type: 'tip',
      title: 'Day-to-day variability',
      body: `Sleep ranged from ${formatHours(worstDay.totalMinutes)} on ${worstDay.label} to ${formatHours(bestDay.totalMinutes)} on ${bestDay.label}. Consistency often improves as circadian rhythm matures.`,
      sources: getSources(SOURCES_CIRCADIAN),
    })
  }

  if (stats.trendPercent !== null && Math.abs(stats.trendPercent) >= 8) {
    insights.push({
      id: 'trend',
      type: stats.trendPercent > 0 ? 'positive' : 'neutral',
      title: stats.trendPercent > 0 ? 'Sleep trending up' : 'Sleep trending down',
      body: `Recent days average ${Math.abs(stats.trendPercent)}% ${stats.trendPercent > 0 ? 'more' : 'less'} sleep than earlier in this period.`,
      sources: getSources(SOURCES_CIRCADIAN),
    })
  }

  return insights.slice(0, 4)
}

export function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Hour blocks for 24h day timeline (0-23) */
export interface TimelineBlock {
  startHour: number
  endHour: number
  kind: 'nap' | 'night' | 'awake'
}

export function getDayTimeline(
  sessions: SleepSession[],
  day: Date,
  now: Date,
): TimelineBlock[] {
  const daySessions = sessionsForDay(sessions, day, now).sort(
    (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime(),
  )
  const blocks: TimelineBlock[] = []
  let cursor = 0

  for (const s of daySessions) {
    const start = parseISO(s.start)
    const end = s.end ? parseISO(s.end) : now
    const startH = start.getHours() + start.getMinutes() / 60
    const endH = end.getHours() + end.getMinutes() / 60
    const sh = Math.max(0, Math.min(24, startH))
    const eh = Math.max(0, Math.min(24, endH < sh ? 24 : endH))

    if (sh > cursor) {
      blocks.push({ startHour: cursor, endHour: sh, kind: 'awake' })
    }
    if (eh > sh) {
      blocks.push({ startHour: sh, endHour: eh, kind: s.kind })
      cursor = eh
    }
  }
  if (cursor < 24) {
    blocks.push({ startHour: cursor, endHour: 24, kind: 'awake' })
  }
  return blocks
}
