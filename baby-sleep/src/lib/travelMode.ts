import { format } from 'date-fns'
import type { DayMarker, SleepSession } from '../types'

export function isTravelDay(
  markers: DayMarker[],
  childId: string,
  now = new Date(),
): boolean {
  const today = format(now, 'yyyy-MM-dd')
  return markers.some(
    (m) => m.childId === childId && m.date === today && m.tag === 'travel',
  )
}

export function travelBedtimeNote(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return `Travel mode: schedules are softer while clocks adjust. Showing times in ${tz}.`
}

export function cloneSessions(sessions: SleepSession[]): SleepSession[] {
  return sessions.map((s) => ({ ...s, feedingTags: s.feedingTags ? [...s.feedingTags] : undefined }))
}
