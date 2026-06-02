import { differenceInMinutes, format, isSameDay, parseISO, subDays } from 'date-fns'
import type { NightWake, NightWakeStats, SleepSession, SleepStatus } from '../types'
import { formatInUntilWithTime } from './timeDisplay'

/** Evening through early morning — suppress nap-style guidance. */
export function isNightHours(now: Date): boolean {
  const h = now.getHours()
  return h >= 19 || h < 7
}

export function getOpenNightSession(
  sessions: SleepSession[],
  childId: string,
): SleepSession | null {
  return (
    sessions.find(
      (s) => s.childId === childId && s.kind === 'night' && s.end === null,
    ) ?? null
  )
}

export function getActiveNightWake(
  nightWakes: NightWake[],
  childId: string,
): NightWake | null {
  return (
    nightWakes.find((w) => w.childId === childId && w.end === null) ?? null
  )
}

export function wakesForNightSession(
  nightWakes: NightWake[],
  nightSessionId: string,
): NightWake[] {
  return nightWakes
    .filter((w) => w.nightSessionId === nightSessionId)
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
}

export function wakesOnCalendarNight(
  nightWakes: NightWake[],
  childId: string,
  anchor: Date,
): NightWake[] {
  return nightWakes
    .filter(
      (w) =>
        w.childId === childId &&
        (isSameDay(parseISO(w.start), anchor) ||
          (w.end && isSameDay(parseISO(w.end), anchor))),
    )
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
}

function wakeDurationMinutes(w: NightWake, now: Date): number {
  const end = w.end ? parseISO(w.end) : now
  return Math.max(0, differenceInMinutes(end, parseISO(w.start)))
}

export function getTypicalResettleMinutes(
  nightWakes: NightWake[],
  childId: string,
  now = new Date(),
): number | null {
  const cutoff = subDays(now, 30)
  const completed = nightWakes.filter(
    (w) =>
      w.childId === childId &&
      w.end &&
      parseISO(w.end).getTime() >= cutoff.getTime(),
  )
  if (completed.length < 2) return null
  const durations = completed.map((w) => wakeDurationMinutes(w, now)).sort((a, b) => a - b)
  const mid = Math.floor(durations.length / 2)
  return durations.length % 2 === 0
    ? Math.round((durations[mid - 1]! + durations[mid]!) / 2)
    : durations[mid]!
}

export function getNightWakeStats(
  sessions: SleepSession[],
  nightWakes: NightWake[],
  childId: string,
  now = new Date(),
): NightWakeStats | null {
  const openNight = getOpenNightSession(sessions, childId)
  const active = getActiveNightWake(nightWakes, childId)
  if (!openNight && !active) {
    const tonight = wakesOnCalendarNight(nightWakes, childId, now)
    if (tonight.length === 0) return null
    const total = tonight.reduce((s, w) => s + wakeDurationMinutes(w, now), 0)
    return {
      sinceBedtimeMinutes: 0,
      bedtimeStarted: '',
      wakesTonight: tonight.length,
      totalAwakeTonightMinutes: total,
      currentWakeMinutes: 0,
      asleepTonightMinutes: 0,
      typicalResettleMinutes: getTypicalResettleMinutes(nightWakes, childId, now),
      aimResettleBy: null,
    }
  }

  const sessionId = openNight?.id ?? active?.nightSessionId
  if (!sessionId || !openNight) return null

  const bedtimeStart = parseISO(openNight.start)
  const sinceBedtimeMinutes = Math.max(0, differenceInMinutes(now, bedtimeStart))

  const forNight = wakesForNightSession(nightWakes, sessionId)
  const completed = forNight.filter((w) => w.end)
  const totalCompleted = completed.reduce((s, w) => s + wakeDurationMinutes(w, now), 0)
  const current = active ? wakeDurationMinutes(active, now) : 0
  const totalAwake = totalCompleted + current
  const asleepTonightMinutes = Math.max(0, sinceBedtimeMinutes - totalAwake)
  const typical = getTypicalResettleMinutes(nightWakes, childId, now)

  let aimResettleBy: Date | null = null
  if (active && typical != null) {
    aimResettleBy = new Date(parseISO(active.start).getTime() + typical * 60_000)
  }

  return {
    sinceBedtimeMinutes,
    bedtimeStarted: openNight.start,
    wakesTonight: forNight.length,
    totalAwakeTonightMinutes: totalAwake,
    currentWakeMinutes: current,
    asleepTonightMinutes,
    typicalResettleMinutes: typical,
    aimResettleBy,
  }
}

export function resolveSleepStatus(
  sessions: SleepSession[],
  nightWakes: NightWake[],
  childId: string,
): SleepStatus {
  const sorted = [...sessions]
    .filter((s) => s.childId === childId)
    .sort((a, b) => parseISO(b.start).getTime() - parseISO(a.start).getTime())

  const openNight = getOpenNightSession(sessions, childId)
  const activeWake = getActiveNightWake(nightWakes, childId)
  const open = sorted.find((s) => s.end === null)
  const lastEnded = sorted.find((s) => s.end !== null)

  if (activeWake && openNight) {
    return {
      isAsleep: false,
      currentSession: openNight,
      lastEndedSession: lastEnded ?? null,
      awakeSince: parseISO(activeWake.start),
      asleepSince: null,
      openNightSession: openNight,
      activeNightWake: activeWake,
    }
  }

  if (open) {
    const asleepSince = parseISO(open.start)
    if (open.kind === 'night') {
      const wakes = wakesForNightSession(nightWakes, open.id)
      const lastWake = wakes.filter((w) => w.end).pop()
      const stretchStart = lastWake?.end ? parseISO(lastWake.end) : asleepSince
      return {
        isAsleep: true,
        currentSession: open,
        lastEndedSession: lastEnded ?? null,
        awakeSince: null,
        asleepSince: stretchStart,
        openNightSession: open,
        activeNightWake: null,
      }
    }
    return {
      isAsleep: true,
      currentSession: open,
      lastEndedSession: lastEnded ?? null,
      awakeSince: null,
      asleepSince,
      openNightSession: null,
      activeNightWake: null,
    }
  }

  const awakeSince = lastEnded?.end ? parseISO(lastEnded.end) : null
  return {
    isAsleep: false,
    currentSession: null,
    lastEndedSession: lastEnded ?? null,
    awakeSince,
    asleepSince: null,
    openNightSession: null,
    activeNightWake: null,
  }
}

export function shouldSuppressNapGuidance(
  status: SleepStatus,
  now = new Date(),
): boolean {
  if (status.activeNightWake) return true
  if (status.openNightSession) return true
  if (isNightHours(now) && status.lastEndedSession?.kind === 'night') {
    const ended = status.lastEndedSession.end
    if (ended && isSameDay(parseISO(ended), now)) return true
  }
  return false
}

export function formatAimResettleLabel(aimBy: Date, now = new Date()): string {
  const mins = differenceInMinutes(aimBy, now)
  if (mins <= 0) return `Aim to resettle soon (around ${format(aimBy, 'h:mm a')})`
  return `Aim to resettle ${formatInUntilWithTime(mins, aimBy)}`
}

export function cloneNightWakes(wakes: NightWake[]): NightWake[] {
  return wakes.map((w) => ({ ...w, feedingTags: w.feedingTags ? [...w.feedingTags] : undefined }))
}
