import { differenceInMinutes, format } from 'date-fns'
import type { NextNapPrediction, WakeWindowGuidance, SleepStatus } from '../types'

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
      <section className="card next-nap">
        <h2>Resting</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          When {status.currentSession?.kind === 'night' ? 'morning' : 'baby'} wakes, we&apos;ll
          calculate the next nap window from age-based wake times.
        </p>
      </section>
    )
  }

  if (!prediction || !guidance) {
    return (
      <section className="card next-nap">
        <h2>Next nap</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Add birth date in Settings to get research-based nap timing.
        </p>
      </section>
    )
  }

  const minsToSweet = differenceInMinutes(prediction.sweetSpot, now)
  const minsToWindowStart = differenceInMinutes(prediction.windowStart, now)
  const minsToWindowEnd = differenceInMinutes(prediction.windowEnd, now)

  let countdownClass = ''
  let countdownText = ''

  if (minsToSweet > 5) {
    countdownText = `Sweet spot in ~${minsToSweet} min`
  } else if (minsToSweet > -15) {
    countdownClass = 'soon'
    countdownText =
      minsToSweet >= 0
        ? 'Sweet spot — good time to start wind-down'
        : 'In the nap window now'
  } else if (minsToWindowEnd > 0) {
    countdownClass = 'soon'
    countdownText = 'Still in typical window — watch sleepy cues'
  } else {
    countdownClass = 'overdue'
    countdownText = 'Past typical window — baby may be overtired; offer nap soon'
  }

  return (
    <section className="card next-nap">
      <h2>Next nap</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
        {guidance.ageLabel} · wake window {guidance.label}
      </p>

      <div className={`countdown ${countdownClass}`}>{countdownText}</div>
      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Awake {awakeMinutes} min · target ~{prediction.targetWakeMinutes} min
      </p>

      <div className="sweet-spot">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ideal wind-down</span>
        <br />
        <strong>{format(prediction.sweetSpot, 'h:mm a')}</strong>
      </div>

      <div className="window">
        <div className="window-block">
          <span>Earliest</span>
          <strong>{format(prediction.windowStart, 'h:mm a')}</strong>
        </div>
        <div className="window-block">
          <span>Latest</span>
          <strong>{format(prediction.windowEnd, 'h:mm a')}</strong>
        </div>
      </div>

      {minsToWindowStart > 0 && (
        <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Window opens in ~{minsToWindowStart} min
        </p>
      )}

      {prediction.adjustmentNote && (
        <p style={{ fontSize: '0.85rem', background: 'var(--warning-soft)', padding: '0.65rem', borderRadius: 8 }}>
          {prediction.adjustmentNote}
        </p>
      )}

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
        {prediction.explanation}
      </p>

      <div className="cues">
        {guidance.sleepyCues.map((c) => (
          <span key={c} className="cue-pill">
            {c}
          </span>
        ))}
      </div>
    </section>
  )
}
