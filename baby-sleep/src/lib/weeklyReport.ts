import { format, parseISO } from 'date-fns'
import type { SleepSession, WeeklyReport } from '../types'
import { getDailySummaries, getPeriodStats } from './analytics'

function medianBedtimeMinutes(sessions: SleepSession[]): number | null {
  const starts = sessions
    .filter((s) => s.kind === 'night')
    .map((s) => {
      const d = parseISO(s.start)
      return d.getHours() * 60 + d.getMinutes()
    })
  if (starts.length === 0) return null
  starts.sort((a, b) => a - b)
  return starts[Math.floor(starts.length / 2)]
}

function formatMinutesAsTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return format(d, 'h:mm a')
}

export function buildWeeklyReport(sessions: SleepSession[], now = new Date()): WeeklyReport {
  const summaries = getDailySummaries(sessions, 7, now)
  const stats = getPeriodStats(summaries)

  const bed = medianBedtimeMinutes(sessions)
  const highlights: string[] = []

  if (stats.daysWithData >= 5) {
    highlights.push(`Logged ${stats.daysWithData} of 7 days — great consistency.`)
  } else {
    highlights.push(`Only ${stats.daysWithData} days logged — log more for stronger trends.`)
  }

  if (stats.avgTotalHours >= 11 && stats.avgTotalHours <= 16) {
    highlights.push(`Total sleep (${stats.avgTotalHours}h/day) looks typical for many infants.`)
  }

  if (stats.trendPercent !== null && Math.abs(stats.trendPercent) >= 10) {
    highlights.push(
      `Sleep is trending ${stats.trendPercent > 0 ? 'up' : 'down'} about ${Math.abs(stats.trendPercent)}% vs. the prior week.`,
    )
  }

  let bedtimeDrift: number | null = null
  const prevBed = medianBedtimeMinutes(
    sessions.filter((s) => parseISO(s.start) < new Date(now.getTime() - 7 * 86400000)),
  )
  if (bed !== null && prevBed !== null) {
    bedtimeDrift = bed - prevBed
    if (Math.abs(bedtimeDrift) >= 15) {
      highlights.push(
        `Bedtime shifted ~${Math.abs(bedtimeDrift)} min ${bedtimeDrift > 0 ? 'later' : 'earlier'} vs. prior week.`,
      )
    }
  }

  return {
    periodLabel: 'Last 7 days',
    avgTotalHours: stats.avgTotalHours,
    avgNapCount: stats.avgNapCount,
    avgBedtime: bed !== null ? formatMinutesAsTime(bed) : null,
    bedtimeDriftMinutes: bedtimeDrift,
    highlights,
  }
}
