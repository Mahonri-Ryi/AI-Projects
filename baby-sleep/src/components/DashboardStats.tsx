import { useMemo } from 'react'
import type { SleepSession } from '../types'
import type { WakeWindowGuidance } from '../types'
import { formatHours, getTodayStats } from '../lib/analytics'
import { StatCard } from './ui/Card'

interface Props {
  sessions: SleepSession[]
  guidance: WakeWindowGuidance | null
  now: Date
}

export function DashboardStats({ sessions, guidance, now }: Props) {
  const targetMin = guidance?.totalSleepHours.min ?? 12
  const targetMax = guidance?.totalSleepHours.max ?? 15

  const today = useMemo(
    () => getTodayStats(sessions, targetMin, targetMax, now),
    [sessions, targetMin, targetMax, now],
  )

  if (!guidance) return null

  return (
    <div className="stat-grid">
      <StatCard
        label="Today"
        value={formatHours(today.totalMinutes)}
        hint="total sleep"
        accent="primary"
      />
      <StatCard
        label="Naps"
        value={String(today.napCount)}
        hint={formatHours(today.napMinutes)}
        accent="default"
      />
    </div>
  )
}
