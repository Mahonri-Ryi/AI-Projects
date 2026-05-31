import { differenceInMinutes, addMinutes, parseISO, isSameDay } from 'date-fns'
import {
  getAgeInMonths,
  getWakeWindowGuidance,
  typicalNapDurationMinutes,
} from '../data/sleepScience'
import type {
  NextNapPrediction,
  SleepSession,
  SleepStatus,
} from '../types'

export function getSleepStatus(
  sessions: SleepSession[],
  _now = new Date(),
): SleepStatus {
  const sorted = [...sessions].sort(
    (a, b) => parseISO(b.start).getTime() - parseISO(a.start).getTime(),
  )
  const open = sorted.find((s) => s.end === null)
  const lastEnded = sorted.find((s) => s.end !== null)

  if (open) {
    return {
      isAsleep: true,
      currentSession: open,
      lastEndedSession: lastEnded ?? null,
      awakeSince: null,
      asleepSince: parseISO(open.start),
    }
  }

  const awakeSince = lastEnded?.end ? parseISO(lastEnded.end) : null
  return {
    isAsleep: false,
    currentSession: null,
    lastEndedSession: lastEnded ?? null,
    awakeSince,
    asleepSince: null,
  }
}

function sessionDurationMinutes(session: SleepSession): number | null {
  if (!session.end) return null
  return differenceInMinutes(parseISO(session.end), parseISO(session.start))
}

function getTodaySessions(sessions: SleepSession[], now: Date): SleepSession[] {
  return sessions.filter((s) => isSameDay(parseISO(s.start), now))
}

function totalDaySleepMinutes(sessions: SleepSession[], now: Date): number {
  return getTodaySessions(sessions, now).reduce((sum, s) => {
    const dur = sessionDurationMinutes(s)
    return sum + (dur ?? 0)
  }, 0)
}

/**
 * Adjust target wake window based on recent sleep (sleep pressure / short nap).
 */
function adjustedWakeMinutes(
  birthDate: string,
  sessions: SleepSession[],
  baseTarget: number,
  now: Date,
): { minutes: number; note?: string } {
  const sorted = [...sessions]
    .filter((s) => s.end)
    .sort((a, b) => parseISO(b.end!).getTime() - parseISO(a.end!).getTime())

  const last = sorted[0]
  if (!last?.end) return { minutes: baseTarget }

  const lastDur = sessionDurationMinutes(last)
  const ageMonths = getAgeInMonths(birthDate, now)
  const typicalNap = typicalNapDurationMinutes(ageMonths)

  if (last.kind === 'nap' && lastDur !== null && lastDur < typicalNap * 0.5) {
    return {
      minutes: Math.max(30, baseTarget - 15),
      note: 'Last nap was short — slightly shorter wake window may help avoid overtiredness.',
    }
  }

  if (last.kind === 'nap' && lastDur !== null && lastDur > typicalNap * 1.4) {
    return {
      minutes: baseTarget + 15,
      note: 'Last nap was long — baby may tolerate a slightly longer wake window.',
    }
  }

  const daySleep = totalDaySleepMinutes(sessions, now)
  const guidance = getWakeWindowGuidance(birthDate, now)
  const targetDayMin = guidance.totalSleepHours.min * 60
  if (daySleep < targetDayMin * 0.6 && getTodaySessions(sessions, now).length >= 2) {
    return {
      minutes: Math.max(30, baseTarget - 10),
      note: 'Less daytime sleep than typical so far — consider an earlier nap.',
    }
  }

  return { minutes: baseTarget }
}

export function predictNextNap(
  birthDate: string,
  sessions: SleepSession[],
  now = new Date(),
): NextNapPrediction | null {
  const status = getSleepStatus(sessions, now)
  const guidance = getWakeWindowGuidance(birthDate, now)

  if (status.isAsleep) {
    return null
  }

  if (!status.awakeSince) {
    return null
  }

  const { minutes: targetWake, note } = adjustedWakeMinutes(
    birthDate,
    sessions,
    guidance.targetMinutes,
    now,
  )

  const windowStart = addMinutes(status.awakeSince, guidance.minMinutes)
  const windowEnd = addMinutes(status.awakeSince, guidance.maxMinutes)
  const sweetSpot = addMinutes(status.awakeSince, targetWake)

  const explanation =
    `Based on ${guidance.ageLabel} research ranges, most babies this age do well with about ${guidance.label} awake before the next nap. Aim for sleepy cues in the window below — put down ~5–10 minutes before overtired fussing when you can.`

  return {
    windowStart,
    windowEnd,
    sweetSpot,
    targetWakeMinutes: targetWake,
    explanation,
    adjustmentNote: note,
  }
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function generateId(): string {
  return crypto.randomUUID()
}
