import type { LoggingStreak } from '../types'

interface Props {
  streak: LoggingStreak
}

export function LoggingStreakChip({ streak }: Props) {
  if (streak.currentDays < 2) return null

  return (
    <div className="streak-chip" role="status">
      <span className="streak-chip__badge">{streak.currentDays}</span>
      <span>{streak.message}</span>
    </div>
  )
}
