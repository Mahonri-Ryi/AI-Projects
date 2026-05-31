import { differenceInMinutes, format } from 'date-fns'
import type { NextBedtimePrediction, SleepStatus } from '../types'
import { formatInUntilWithTime } from '../lib/timeDisplay'
import { travelBedtimeNote } from '../lib/travelMode'
import { Card } from './ui/Card'
import { ResearchLinks } from './ui/ResearchLinks'

interface Props {
  prediction: NextBedtimePrediction | null
  status: SleepStatus
  now: Date
  nightStartedToday: boolean
  travelMode?: boolean
}

export function NextBedtimeCard({
  prediction,
  status,
  now,
  nightStartedToday,
  travelMode = false,
}: Props) {
  if (status.isAsleep && status.currentSession?.kind === 'night') {
    return (
      <Card title="Bedtime" subtitle="Night sleep in progress">
        <p className="prose">
          Bedtime started at{' '}
          <strong>{format(status.asleepSince!, 'h:mm a')}</strong>. We&apos;ll suggest tomorrow&apos;s
          window after morning wake-up.
        </p>
      </Card>
    )
  }

  if (status.isAsleep) {
    return (
      <Card title="Bedtime" subtitle="We'll calculate timing when baby wakes">
        <p className="prose">
          Finish the current nap, then tap <strong>Wake up</strong> to refresh tonight&apos;s bedtime
          window.
        </p>
      </Card>
    )
  }

  if (nightStartedToday) {
    return (
      <Card title="Bedtime" subtitle="Logged for today">
        <p className="prose">
          Night sleep is already on today&apos;s log. Tomorrow&apos;s bedtime suggestion will appear
          after the next morning wake-up.
        </p>
      </Card>
    )
  }

  if (!prediction) {
    return (
      <Card title="Bedtime" subtitle="Personalized evening schedule">
        <p className="prose">Add birth date in Settings for this child to unlock bedtime guidance.</p>
      </Card>
    )
  }

  const minsToSweet = differenceInMinutes(prediction.sweetSpot, now)
  const minsToWindowStart = differenceInMinutes(prediction.windowStart, now)
  const minsToWindowEnd = differenceInMinutes(prediction.windowEnd, now)

  let countdownClass = ''
  let countdownText: string

  if (minsToSweet > 60) {
    countdownText = `Tonight's wind-down around ${format(prediction.sweetSpot, 'h:mm a')}`
  } else if (minsToSweet > 10) {
    countdownText = `Begin wind-down ${formatInUntilWithTime(minsToSweet, prediction.sweetSpot)}`
  } else if (minsToSweet > -20) {
    countdownClass = 'soon'
    countdownText =
      minsToSweet >= 0
        ? 'Bedtime window — start calming routine now'
        : 'Within recommended bedtime window'
  } else if (minsToWindowEnd > 0) {
    countdownClass = 'soon'
    countdownText = 'Extended evening window — watch sleepy cues'
  } else {
    countdownClass = 'overdue'
    countdownText = 'Past typical bedtime — prioritize sleep soon'
  }

  return (
    <Card
      title="Bedtime"
      subtitle={
        prediction.flexibleSchedule
          ? 'Flexible evening rhythm (newborn)'
          : prediction.learnedFromHistory
            ? 'Based on your logs + age guidance'
            : 'Age-based evening guidance'
      }
    >
      <div className={`next-nap__countdown ${countdownClass}`}>{countdownText}</div>

      <div className="next-nap__sweet next-nap__sweet--bedtime">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          RECOMMENDED BEDTIME
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

      {minsToWindowStart > 0 && minsToSweet > 60 && (
        <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          Window opens {formatInUntilWithTime(minsToWindowStart, prediction.windowStart)}
        </p>
      )}

      {travelMode && (
        <p
          className="travel-note"
          style={{
            fontSize: '0.85rem',
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'var(--info-soft, var(--warning-soft))',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          {travelBedtimeNote()}
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
    </Card>
  )
}
