import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { DAY_MARKER_LABELS, type DayMarker, type DayMarkerTag } from '../types'
import { todayDateString } from '../lib/dayMarkers'
import { Card } from './ui/Card'

const TAGS = Object.keys(DAY_MARKER_LABELS) as DayMarkerTag[]

interface Props {
  markers: DayMarker[]
  onSet: (date: string, tag: DayMarkerTag, note?: string) => void
  onClear: (markerId: string) => void
  now?: Date
}

export function DayMarkersCard({ markers, onSet, onClear, now = new Date() }: Props) {
  const today = todayDateString(now)
  const todayMarker = markers.find((m) => m.date === today)
  const [note, setNote] = useState(todayMarker?.note ?? '')

  useEffect(() => {
    const t = window.setTimeout(() => setNote(todayMarker?.note ?? ''), 0)
    return () => window.clearTimeout(t)
  }, [todayMarker?.id, todayMarker?.note])

  const applyTag = (tag: DayMarkerTag) => {
    onSet(today, tag, note.trim() || undefined)
  }

  return (
    <Card title="Day markers" subtitle="Tag regressions, teething, travel, and more">
      <label className="form-field">
        <span>Today ({format(now, 'MMM d')})</span>
        <select
          value={todayMarker?.tag ?? ''}
          onChange={(e) => {
            const tag = e.target.value as DayMarkerTag
            if (tag) applyTag(tag)
          }}
        >
          <option value="">No marker</option>
          {TAGS.map((t) => (
            <option key={t} value={t}>
              {DAY_MARKER_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span>Note for today (optional)</span>
        <input
          type="text"
          placeholder="e.g. Skipped second nap — guests over"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => {
            if (todayMarker) onSet(today, todayMarker.tag, note.trim() || undefined)
          }}
        />
      </label>
      {todayMarker && (
        <button
          type="button"
          className="btn btn--ghost"
          style={{ marginBottom: '1rem' }}
          onClick={() => onClear(todayMarker.id)}
        >
          Clear today’s marker
        </button>
      )}
      {markers.length > 0 && (
        <ul className="markers-list">
          {[...markers]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 8)
            .map((m) => (
              <li key={m.id}>
                <span>{m.date}</span>
                <div>
                  <strong>{DAY_MARKER_LABELS[m.tag]}</strong>
                  {m.note && <p className="markers-list__note">{m.note}</p>}
                </div>
                <button type="button" className="btn-icon" onClick={() => onClear(m.id)}>
                  Remove
                </button>
              </li>
            ))}
        </ul>
      )}
    </Card>
  )
}
