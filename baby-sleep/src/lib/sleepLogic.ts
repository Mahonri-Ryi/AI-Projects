import {
  differenceInMinutes,
  addMinutes,
  parseISO,
  isSameDay,
  startOfDay,
  setHours,
  setMinutes,
  subDays,
  subMinutes,
  max,
} from 'date-fns'
import {
  getSources,
  SOURCES_BEDTIME,
  SOURCES_SHORT_NAP,
  SOURCES_WAKE_WINDOWS,
} from '../data/researchCatalog'
import {
  getAgeInMonths,
  getBedtimeGuidance,
  getWakeWindowGuidance,
  typicalNapDurationMinutes,
} from '../data/sleepScience'
import type {
  ChildRoutine,
  NextBedtimePrediction,
  NextNapPrediction,
  SleepSession,
  SleepStatus,
} from '../types'

export function getSleepStatus(sessions: SleepSession[]): SleepStatus {
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
): { minutes: number; note?: string; usedShortNapSources?: boolean } {
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
      usedShortNapSources: true,
    }
  }

  if (last.kind === 'nap' && lastDur !== null && lastDur > typicalNap * 1.4) {
    return {
      minutes: baseTarget + 15,
      note: 'Last nap was long — baby may tolerate a slightly longer wake window.',
      usedShortNapSources: true,
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
  routine?: ChildRoutine,
): NextNapPrediction | null {
  const status = getSleepStatus(sessions)
  const guidance = getWakeWindowGuidance(birthDate, now)

  if (status.isAsleep) {
    return null
  }

  if (!status.awakeSince) {
    return null
  }

  const baseTarget = routine?.customWakeTargetMinutes ?? guidance.targetMinutes

  const { minutes: targetWake, note, usedShortNapSources } = adjustedWakeMinutes(
    birthDate,
    sessions,
    baseTarget,
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
    sources: getSources(SOURCES_WAKE_WINDOWS),
    adjustmentSources: usedShortNapSources ? getSources(SOURCES_SHORT_NAP) : undefined,
  }
}

function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

function dateAtMinutesFromMidnight(day: Date, totalMinutes: number): Date {
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  return setMinutes(setHours(startOfDay(day), h), m)
}

/** Median local start time of logged night sleep (last 14 days). */
export function medianNightStartMinutes(
  sessions: SleepSession[],
  now = new Date(),
  lookbackDays = 14,
): number | null {
  const cutoff = subDays(now, lookbackDays)
  const starts = sessions
    .filter((s) => s.kind === 'night' && parseISO(s.start) >= cutoff)
    .map((s) => minutesSinceMidnight(parseISO(s.start)))

  if (starts.length < 2) return null
  starts.sort((a, b) => a - b)
  return starts[Math.floor(starts.length / 2)]
}

/** Evening bedtime already logged today (not early-morning night sleep). */
export function eveningBedtimeLoggedToday(sessions: SleepSession[], now: Date): boolean {
  return sessions.some((s) => {
    if (s.kind !== 'night') return false
    const start = parseISO(s.start)
    if (!isSameDay(start, now)) return false
    if (s.end === null) return true
    return start.getHours() >= 17
  })
}

export function predictNextBedtime(
  birthDate: string,
  sessions: SleepSession[],
  now = new Date(),
  routine?: ChildRoutine,
  travelMode = false,
): NextBedtimePrediction | null {
  const status = getSleepStatus(sessions)
  const guidance = getBedtimeGuidance(birthDate, now)

  if (status.isAsleep) {
    return null
  }

  if (eveningBedtimeLoggedToday(sessions, now)) {
    return null
  }

  const learnedMedian = medianNightStartMinutes(sessions, now)
  let targetMinutes = guidance.typicalStartMinutes
  let learnedFromHistory = false

  if (learnedMedian !== null) {
    targetMinutes = Math.round(guidance.typicalStartMinutes * 0.35 + learnedMedian * 0.65)
    learnedFromHistory = true
  }

  if (routine?.preferredBedtimeMinutes != null) {
    targetMinutes = routine.preferredBedtimeMinutes
    learnedFromHistory = false
  }

  let sweetSpot = dateAtMinutesFromMidnight(now, targetMinutes)
  let adjustmentNote: string | undefined
  let adjustmentSources: ReturnType<typeof getSources> | undefined

  if (status.awakeSince) {
    const sorted = [...sessions]
      .filter((s) => s.end)
      .sort((a, b) => parseISO(b.end!).getTime() - parseISO(a.end!).getTime())
    const last = sorted[0]
    const lastDur = last ? sessionDurationMinutes(last) : null
    const ageMonths = getAgeInMonths(birthDate, now)
    const typicalNap = typicalNapDurationMinutes(ageMonths)

    let stretch = guidance.lastStretchWakeMinutes
    if (last?.kind === 'nap' && lastDur !== null && lastDur < typicalNap * 0.5) {
      stretch = Math.max(45, stretch - 20)
      adjustmentNote =
        'Last nap was short — an earlier bedtime may help make up for lost daytime sleep.'
      adjustmentSources = getSources(SOURCES_SHORT_NAP)
    } else if (last?.kind === 'nap' && lastDur !== null && lastDur > typicalNap * 1.4) {
      stretch = stretch + 15
      adjustmentNote =
        'Last nap was long — baby may handle a slightly later bedtime if cues are good.'
      adjustmentSources = getSources(SOURCES_SHORT_NAP)
    }

    const wakeBased = addMinutes(status.awakeSince, stretch)
    if (wakeBased > sweetSpot || now.getHours() >= 15) {
      sweetSpot = wakeBased > sweetSpot ? wakeBased : sweetSpot
    }
  }

  let windowStart = max([
    dateAtMinutesFromMidnight(now, guidance.windowStartMinutes),
    subMinutes(sweetSpot, 45),
  ])
  let windowEnd = max([
    dateAtMinutesFromMidnight(now, guidance.windowEndMinutes),
    addMinutes(sweetSpot, 30),
  ])

  if (travelMode) {
    windowStart = subMinutes(sweetSpot, 75)
    windowEnd = addMinutes(sweetSpot, 75)
    if (!adjustmentNote) {
      adjustmentNote =
        'Travel mode: wider bedtime window while schedules adjust. Prioritize sleepy cues over the clock.'
    }
  }

  const historyNote = learnedFromHistory
    ? ' Blends your recent logged bedtimes with age-typical evening sleep.'
    : ''

  const explanation = guidance.flexibleSchedule
    ? `Newborns often have flexible evening sleep. When cues appear, aim for a calm wind-down in the window below. As circadian rhythm matures (~3–4 months), a more consistent bedtime helps.${historyNote}`
    : `Evening sleep works best with a fairly consistent bedtime. We suggest wind-down in the window below — watch sleepy cues and adjust for your baby.${historyNote}`

  return {
    windowStart,
    windowEnd: max([windowEnd, addMinutes(sweetSpot, 15)]),
    sweetSpot,
    explanation,
    adjustmentNote,
    adjustmentSources,
    sources: getSources(SOURCES_BEDTIME),
    learnedFromHistory,
    flexibleSchedule: guidance.flexibleSchedule,
  }
}

export const DEFAULT_REMINDER_SETTINGS = {
  enabled: false,
  napMinutesBefore: 10,
  bedtimeMinutesBefore: 15,
} as const

export { formatDurationWords as formatDuration } from './timeDisplay'

export function generateId(): string {
  return crypto.randomUUID()
}
