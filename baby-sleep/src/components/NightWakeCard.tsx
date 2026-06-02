import type { NightWakeStats } from '../types'
import { formatAimResettleLabel } from '../lib/nightWake'
import { formatDurationWords } from '../lib/timeDisplay'
import { Card } from './ui/Card'

interface Props {
  stats: NightWakeStats
  now: Date
}

export function NightWakeCard({ stats, now }: Props) {
  const { currentWakeMinutes, totalAwakeTonightMinutes, wakesTonight, typicalResettleMinutes, aimResettleBy } =
    stats

  return (
    <Card
      title="Night wake"
      subtitle="Same night sleep — feeding & resettle"
      className="night-wake-card"
    >
      {currentWakeMinutes > 0 && (
        <div className="night-wake-card__hero">
          <span className="night-wake-card__label">Awake this wake</span>
          <strong className="night-wake-card__time">{formatDurationWords(currentWakeMinutes)}</strong>
        </div>
      )}

      <ul className="night-wake-card__stats">
        <li>
          <span>Since bedtime</span>
          <strong>{formatDurationWords(stats.sinceBedtimeMinutes)}</strong>
        </li>
        <li>
          <span>Asleep tonight</span>
          <strong>{formatDurationWords(stats.asleepTonightMinutes)}</strong>
        </li>
        <li>
          <span>Total awake tonight</span>
          <strong>{formatDurationWords(totalAwakeTonightMinutes)}</strong>
        </li>
        <li>
          <span>Wakes tonight</span>
          <strong>{wakesTonight}</strong>
        </li>
        {typicalResettleMinutes != null && (
          <li>
            <span>Your typical resettle</span>
            <strong>~{formatDurationWords(typicalResettleMinutes)}</strong>
          </li>
        )}
      </ul>

      {aimResettleBy && currentWakeMinutes > 0 && (
        <p className="night-wake-card__aim">{formatAimResettleLabel(aimResettleBy, now)}</p>
      )}

      <p className="prose" style={{ fontSize: '0.85rem', marginTop: '0.75rem' }}>
        Tap <strong>Up for feed</strong> or <strong>Back to sleep</strong> to log the time — choose{' '}
        <strong>Use now</strong> or set the actual time if you&apos;re catching up later. Use{' '}
        <strong>Wake up (morning)</strong> only when the night is over.
      </p>
    </Card>
  )
}
