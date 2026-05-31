import { differenceInMinutes, format } from 'date-fns'
import type { NextNapPrediction, WakeWindowGuidance, SleepStatus } from '../types'
import { Card } from './ui/Card'

interface Props {
  prediction: NextNapPrediction | null
  guidance: WakeWindowGuidance | null
  status: SleepStatus
  awakeMinutes: number
  now: Date
}

export function NextNapCard({
  prediction,
  guidance,
  status,
  awakeMinutes,
  now,
}: Props) {
  if (status.isAsleep) {
    return (
      <Card title="Next nap" subtitle="We'll calculate timing when baby wakes">
        <p className="prose">
          Rest periods are excluded from wake-window math. Tap <strong>Wake up</strong> when ready.
        </p>
      </Card>
    )
  }

  if (!prediction || !guidance) {
    return (
      <Card title="Next nap" subtitle="Personalized scheduling">
        <p className="prose">Add your baby&apos;s birth date in Settings to unlock age-based nap windows.</p>
      </Card>
    )
  }

  const minsToSweet = differenceInMinutes(prediction.sweetSpot, now)
  const minsToWindowStart = differenceInMinutes(prediction.windowStart, now)
  const minsToWindowEnd = differenceInMinutes(prediction.windowEnd, now)

  let countdownClass = ''
  let countdownText = ''

  if (minsToSweet > 5) {
    countdownText = `Optimal wind-down in ~${minsToSweet} min`
  } else if (minsToSweet > -15) {
    countdownClass = 'soon'
    countdownText =
      minsToSweet >= 0
        ? 'Optimal window — begin wind-down now'
        : 'Within recommended nap window'
  } else if (minsToWindowEnd > 0) {
    countdownClass = 'soon'
    countdownText = 'Extended wake window — watch sleepy cues'
  } else {
    countdownClass = 'overdue'
    countdownText = 'Past typical window — prioritize nap soon'
  }

  return (
    <Card
      title="Next nap"
      subtitle={`${guidance.ageLabel} · ${guidance.label} wake window`}
    >
      <div className={`next-nap__countdown ${countdownClass}`}>{countdownText}</div>
      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Awake {awakeMinutes}m · target ~{prediction.targetWakeMinutes}m
      </p>

      <div className="next-nap__sweet">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          RECOMMENDED WIND-DOWN
        </span>
        <time>{format(prediction.sweetSpot, 'h:mm a')}</time>
      </div>

      <div className="next-nap__windows">
        <div className="next-nap__window">
          <span>Earliest</span>
          <strong>{format(prediction.windowStart, 'h:mm a')}</strong>
        </div>
        <div className="next-nap__window">
          <span>Latest</span>
          <strong>{format(prediction.windowEnd, 'h:mm a')}</strong>
        </div>
      </div>

      {minsToWindowStart > 0 && (
        <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          Window opens in ~{minsToWindowStart} min
        </p>
      )}

      {prediction.adjustmentNote && (
        <p
          style={{
            fontSize: '0.85rem',
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'var(--warning-soft)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          {prediction.adjustmentNote}
        </p>
      )}

      <div className="cue-pills">
        {guidance.sleepyCues.map((c) => (
          <span key={c} className="cue-pill">
            {c}
          </span>
        ))}
      </div>
    </Card>
  )
}
