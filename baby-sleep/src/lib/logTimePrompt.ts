import { subDays } from 'date-fns'

export type LogTimePromptKind =
  | 'start-nap'
  | 'start-bedtime'
  | 'wake-nap'
  | 'wake-morning'
  | 'night-wake-start'
  | 'night-wake-end'

export function defaultMinTimeForLog(kind: LogTimePromptKind, now: Date): Date {
  if (kind === 'start-nap' || kind === 'start-bedtime') {
    return subDays(now, 3)
  }
  return subDays(now, 1)
}
