import { format } from 'date-fns'
import { IconMoon, IconSun } from './icons'
import type { SleepStatus } from '../types'

interface Props {
  status: SleepStatus
  awakeMinutes: number
  asleepMinutes: number
  formatDuration: (m: number) => string
}

export function StatusHero({ status, awakeMinutes, asleepMinutes, formatDuration }: Props) {
  const isNightWake = Boolean(status.activeNightWake)
  const isAsleep = status.isAsleep && !isNightWake

  const label = isNightWake
    ? 'Night wake'
    : isAsleep
      ? status.currentSession?.kind === 'night'
        ? 'Night sleep'
        : 'Napping'
      : 'Awake'

  const minutes = isAsleep ? asleepMinutes : awakeMinutes
  const note = isNightWake
    ? status.awakeSince
      ? `Since ${format(status.awakeSince, 'h:mm a')}`
      : ''
    : isAsleep
      ? status.asleepSince
        ? `Since ${format(status.asleepSince, 'h:mm a')}`
        : ''
      : status.awakeSince
        ? `Since ${format(status.awakeSince, 'h:mm a')}`
        : 'Start a session to begin tracking'

  return (
    <div className={`status-hero ${isNightWake ? 'status-hero--night-wake' : ''}`}>
      <div className="status-hero__label">
        {isAsleep ? <IconMoon size={14} /> : <IconSun size={14} />}
        <span style={{ marginLeft: 6 }}>{label}</span>
      </div>
      <div className="status-hero__timer">{formatDuration(minutes)}</div>
      <p className="status-hero__note">{note}</p>
    </div>
  )
}
