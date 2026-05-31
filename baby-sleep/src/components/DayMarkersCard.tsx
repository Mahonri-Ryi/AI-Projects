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

  return (
    <Card title="Day markers" subtitle="Tag regressions, teething, travel, and more">
      <label className="form-field">
        <span>Today ({format(now, 'MMM d')})</span>
        <select
          value={todayMarker?.tag ?? ''}
          onChange={(e) => {
            const tag = e.target.value as DayMarkerTag
            if (tag) onSet(today, tag)
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
                <strong>{DAY_MARKER_LABELS[m.tag]}</strong>
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
