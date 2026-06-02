import { format, parseISO } from 'date-fns'
import { IconMoon, IconSun } from './icons'
import type { NightWakeStats, SleepStatus } from '../types'
import { formatDurationWords } from '../lib/timeDisplay'

interface Props {
  status: SleepStatus
  awakeMinutes: number
  asleepMinutes: number
  formatDuration: (m: number) => string
  nightStats?: NightWakeStats | null
}

export function StatusHero({
  status,
  awakeMinutes,
  asleepMinutes,
  formatDuration,
  nightStats,
}: Props) {
  const isNightWake = Boolean(status.activeNightWake)
  const openNight = status.openNightSession
  const inOngoingNight = Boolean(openNight && nightStats)

  if (inOngoingNight && nightStats) {
    const bedtimeLabel = format(parseISO(nightStats.bedtimeStarted), 'h:mm a')
    return (
      <div className={`status-hero ${isNightWake ? 'status-hero--night-wake' : ''}`}>
        <div className="status-hero__label">
          <IconMoon size={14} />
          <span style={{ marginLeft: 6 }}>Tonight since bedtime</span>
        </div>
        <div className="status-hero__timer">{formatDuration(nightStats.sinceBedtimeMinutes)}</div>
        <p className="status-hero__note">Bedtime started {bedtimeLabel}</p>

        <div className="status-hero__night-grid">
          <div className="status-hero__night-stat">
            <span>Asleep tonight</span>
            <strong>{formatDurationWords(nightStats.asleepTonightMinutes)}</strong>
          </div>
          <div className="status-hero__night-stat">
            <span>Wakes</span>
            <strong>{nightStats.wakesTonight}</strong>
          </div>
          <div className="status-hero__night-stat">
            <span>Awake tonight</span>
            <strong>{formatDurationWords(nightStats.totalAwakeTonightMinutes)}</strong>
          </div>
          {isNightWake && nightStats.currentWakeMinutes > 0 && (
            <div className="status-hero__night-stat status-hero__night-stat--active">
              <span>Awake this wake</span>
              <strong>{formatDurationWords(nightStats.currentWakeMinutes)}</strong>
            </div>
          )}
        </div>
      </div>
    )
  }

  const isAsleep = status.isAsleep && !isNightWake
  const label = isAsleep
    ? status.currentSession?.kind === 'night'
      ? 'Night sleep'
      : 'Napping'
    : 'Awake'

  const minutes = isAsleep ? asleepMinutes : awakeMinutes
  const note = isAsleep
    ? status.asleepSince
      ? `Since ${format(status.asleepSince, 'h:mm a')}`
      : ''
    : status.awakeSince
      ? `Since ${format(status.awakeSince, 'h:mm a')}`
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
