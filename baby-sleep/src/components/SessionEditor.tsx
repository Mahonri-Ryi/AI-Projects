import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import type { SleepKind, SleepSession } from '../types'
import { Card } from './ui/Card'

interface Props {
  session: SleepSession
  onSave: (patch: { kind: SleepKind; start: string; end: string | null }) => void
  onCancel: () => void
}

function toLocalInput(iso: string): string {
  const d = parseISO(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(value: string): string {
  return new Date(value).toISOString()
}

export function SessionEditor({ session, onSave, onCancel }: Props) {
  const [kind, setKind] = useState<SleepKind>(session.kind)
  const [start, setStart] = useState(toLocalInput(session.start))
  const [end, setEnd] = useState(session.end ? toLocalInput(session.end) : '')
  const [inProgress, setInProgress] = useState(!session.end)

  return (
    <Card title="Edit session" subtitle={format(parseISO(session.start), 'EEE, MMM d')}>
      <label className="form-field">
        <span>Type</span>
        <select value={kind} onChange={(e) => setKind(e.target.value as SleepKind)}>
          <option value="nap">Nap</option>
          <option value="night">Bedtime / night</option>
        </select>
      </label>
      <label className="form-field">
        <span>Start</span>
        <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
      </label>
      <label className="form-field reminder-toggle">
        <input
          type="checkbox"
          checked={inProgress}
          onChange={(e) => setInProgress(e.target.checked)}
        />
        <span>Still in progress</span>
      </label>
      {!inProgress && (
        <label className="form-field">
          <span>End</span>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      )}
      <div className="btn-row" style={{ marginTop: '1rem' }}>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() =>
            onSave({
              kind,
              start: fromLocalInput(start),
              end: inProgress ? null : end ? fromLocalInput(end) : null,
            })
          }
        >
          Save
        </button>
      </div>
    </Card>
  )
}
