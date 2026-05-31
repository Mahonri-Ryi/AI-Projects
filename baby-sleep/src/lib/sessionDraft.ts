import type { SleepSession } from '../types'

/** Sensible defaults for manual backfill on History (completed nap ~90 min). */
export function buildManualSessionDraft(childId: string): SleepSession {
  const end = new Date()
  const start = new Date(end.getTime() - 90 * 60_000)
  return {
    id: '__draft__',
    childId,
    kind: 'nap',
    start: start.toISOString(),
    end: end.toISOString(),
  }
}
