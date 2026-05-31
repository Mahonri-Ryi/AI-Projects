import { differenceInMinutes, parseISO } from 'date-fns'
import type { SleepHint, SleepSession, WakeWindowGuidance } from '../types'
import { getTodayStats } from './analytics'
import { getSleepStatus } from './sleepLogic'
import { formatDurationWords } from './timeDisplay'

export function generateSleepHints(
  sessions: SleepSession[],
  guidance: WakeWindowGuidance | null,
  now = new Date(),
): SleepHint[] {
  const hints: SleepHint[] = []
  if (!guidance) return hints

  const status = getSleepStatus(sessions)
  const today = getTodayStats(
    sessions,
    guidance.totalSleepHours.min,
    guidance.totalSleepHours.max,
    now,
  )

  if (status.isAsleep) return hints

  if (status.awakeSince) {
    const awakeMin = differenceInMinutes(now, status.awakeSince)
    if (awakeMin > guidance.maxMinutes + 20) {
      hints.push({
        id: 'overtired',
        severity: 'action',
        title: 'Likely overtired',
        body: `Awake ${formatDurationWords(awakeMin)} — past the typical ${formatDurationWords(guidance.maxMinutes)} window. Prioritize nap or bedtime and watch for fussiness.`,
      })
    } else if (awakeMin > guidance.targetMinutes + 15) {
      hints.push({
        id: 'stretching',
        severity: 'watch',
        title: 'Wake window stretching',
        body: `Awake ${formatDurationWords(awakeMin)}. Start wind-down soon if you see sleepy cues.`,
      })
    }
  }

  if (today.totalMinutes > 0 && today.totalMinutes < today.targetMin * 0.85) {
    hints.push({
      id: 'undertired-day',
      severity: 'watch',
      title: 'Less sleep than typical today',
      body: `About ${Math.round(today.totalMinutes / 60)}h so far vs. ${guidance.totalSleepHours.min}–${guidance.totalSleepHours.max}h target. An extra nap or earlier bed may help.`,
    })
  }

  const shortNaps = sessions.filter((s) => {
    if (s.kind !== 'nap' || !s.end) return false
    const m = differenceInMinutes(parseISO(s.end), parseISO(s.start))
    return m < 30
  })
  if (shortNaps.length >= 2) {
    hints.push({
      id: 'short-naps',
      severity: 'info',
      title: 'Several short naps',
      body: 'Multiple catnaps can mean sleep pressure builds faster — shorter wake windows may help.',
    })
  }

  return hints.slice(0, 3)
}
