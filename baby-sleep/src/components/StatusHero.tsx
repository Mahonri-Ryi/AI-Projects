import { IconMoon, IconSun } from './icons'
import type { SleepStatus } from '../types'

interface Props {
  status: SleepStatus
  awakeMinutes: number
  asleepMinutes: number
  formatDuration: (m: number) => string
}

export function StatusHero({ status, awakeMinutes, asleepMinutes, formatDuration }: Props) {
  const isAsleep = status.isAsleep
  const label = isAsleep
    ? status.currentSession?.kind === 'night'
      ? 'Night sleep'
      : 'Napping'
    : 'Awake'

  const minutes = isAsleep ? asleepMinutes : awakeMinutes
  const note = isAsleep
    ? `Since ${status.asleepSince?.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : status.awakeSince
      ? `Since ${status.awakeSince.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      : 'Start a session to begin tracking'

  return (
    <div className="status-hero">
      <div className="status-hero__label">
        {isAsleep ? <IconMoon size={14} /> : <IconSun size={14} />}
        <span style={{ marginLeft: 6 }}>{label}</span>
      </div>
      <div className="status-hero__timer">{formatDuration(minutes)}</div>
      <p className="status-hero__note">{note}</p>
    </div>
  )
}
