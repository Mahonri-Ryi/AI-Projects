import { format } from 'date-fns'

/** Human-readable duration: "45 min", "1 hr 31 min", "3 hr". */
export function formatDurationWords(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(Math.abs(totalMinutes)))
  const h = Math.floor(minutes / 60)
  const m = minutes % 60

  if (h === 0) return m === 1 ? '1 min' : `${m} min`
  if (m === 0) return h === 1 ? '1 hr' : `${h} hr`
  const hPart = h === 1 ? '1 hr' : `${h} hr`
  const mPart = m === 1 ? '1 min' : `${m} min`
  return `${hPart} ${mPart}`
}

/** "~1 hr 31 min · 11:31 AM" */
export function formatMinutesUntilWithTime(minutesUntil: number, target: Date): string {
  if (minutesUntil <= 0) return format(target, 'h:mm a')
  return `~${formatDurationWords(minutesUntil)} · ${format(target, 'h:mm a')}`
}

/** "in ~1 hr 31 min · 11:31 AM" */
export function formatInUntilWithTime(minutesUntil: number, target: Date): string {
  if (minutesUntil <= 0) return `at ${format(target, 'h:mm a')}`
  return `in ${formatMinutesUntilWithTime(minutesUntil, target)}`
}
