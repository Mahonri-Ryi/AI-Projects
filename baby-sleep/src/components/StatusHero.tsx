import type { SleepStatus } from '../types'

interface Props {
  status: SleepStatus
  name: string
  awakeMinutes: number
  asleepMinutes: number
  formatDuration: (m: number) => string
}

export function StatusHero({
  status,
  name,
  awakeMinutes,
  asleepMinutes,
  formatDuration,
}: Props) {
  const label = status.isAsleep
    ? status.currentSession?.kind === 'night'
      ? 'Night sleep'
      : 'Napping'
    : 'Awake'

  const minutes = status.isAsleep ? asleepMinutes : awakeMinutes
  const note = status.isAsleep
    ? `Started ${status.asleepSince?.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : status.awakeSince
      ? `Woke ${status.awakeSince.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      : 'Log sleep to start tracking'

  return (
    <section className="card hero">
      <div className="status-label">{name} · {label}</div>
      <div className="timer">{formatDuration(minutes)}</div>
      <div className="timer-note">{note}</div>
    </section>
  )
}
