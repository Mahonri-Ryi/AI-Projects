import { format, parseISO, subDays, startOfDay } from 'date-fns'
import type { LoggingStreak, SleepSession } from '../types'

function hasLogOnDay(sessions: SleepSession[], day: Date): boolean {
  const key = format(day, 'yyyy-MM-dd')
  return sessions.some((s) => {
    const start = parseISO(s.start)
    const end = s.end ? parseISO(s.end) : new Date()
    return format(start, 'yyyy-MM-dd') === key || format(end, 'yyyy-MM-dd') === key
  })
}

export function getLoggingStreak(sessions: SleepSession[], now = new Date()): LoggingStreak {
  let streak = 0
  let day = startOfDay(now)

  while (hasLogOnDay(sessions, day)) {
    streak += 1
    day = subDays(day, 1)
  }

  let message = 'Log today to start a streak'
  if (streak === 1) message = 'Logged today — keep it up tomorrow'
  if (streak >= 2 && streak < 7) message = `${streak} days in a row — nice consistency`
  if (streak >= 7) message = `${streak} days in a row — great habit`

  return { currentDays: streak, message }
}
