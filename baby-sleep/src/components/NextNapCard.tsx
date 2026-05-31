import { differenceInMinutes, format } from 'date-fns'
import { getSources, SOURCES_SLEEPY_CUES } from '../data/researchCatalog'
import { formatDurationWords, formatInUntilWithTime } from '../lib/timeDisplay'
import type { NextNapPrediction, WakeWindowGuidance, SleepStatus } from '../types'
import { Card } from './ui/Card'
import { ResearchLinks } from './ui/ResearchLinks'

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
        <p className="prose">Add birth date in Settings for this child to unlock age-based nap windows.</p>
      </Card>
    )
  }

  const minsToSweet = differenceInMinutes(prediction.sweetSpot, now)
  const minsToWindowStart = differenceInMinutes(prediction.windowStart, now)
  const minsToWindowEnd = differenceInMinutes(prediction.windowEnd, now)

  let countdownClass = ''
  let countdownText: string

  if (minsToSweet > 5) {
    countdownText = `Optimal wind-down ${formatInUntilWithTime(minsToSweet, prediction.sweetSpot)}`
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
        Awake {formatDurationWords(awakeMinutes)} · target ~{formatDurationWords(prediction.targetWakeMinutes)}
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
          Window opens {formatInUntilWithTime(minsToWindowStart, prediction.windowStart)}
        </p>
      )}

      {prediction.adjustmentNote && (
        <>
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
          {prediction.adjustmentSources && (
            <ResearchLinks
              sources={prediction.adjustmentSources}
              title="Why we adjusted this"
              compact
            />
          )}
        </>
      )}

      <p className="prose" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
        {prediction.explanation}
      </p>

      <ResearchLinks sources={prediction.sources} title="Why we suggest this timing" compact />

      <div className="cue-pills">
        {guidance.sleepyCues.map((c) => (
          <span key={c} className="cue-pill">
            {c}
          </span>
        ))}
      </div>
      <ResearchLinks sources={getSources(SOURCES_SLEEPY_CUES)} title="Research on sleepy cues" compact />
    </Card>
  )
}
