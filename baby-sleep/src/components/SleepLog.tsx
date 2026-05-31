import { format, parseISO } from 'date-fns'
import type { SleepSession } from '../types'
import { formatDuration } from '../lib/sleepLogic'
import { Card } from './ui/Card'

interface Props {
  sessions: SleepSession[]
  onDelete: (id: string) => void
}

function sessionMinutes(s: SleepSession): number | null {
  if (!s.end) return null
  return Math.round(
    (parseISO(s.end).getTime() - parseISO(s.start).getTime()) / 60_000,
  )
}

export function SleepLog({ sessions, onDelete }: Props) {
  if (sessions.length === 0) {
    return (
      <Card title="Sleep history" subtitle="All logged sessions">
        <p className="prose">No sessions yet. Log naps and bedtime from the Dashboard.</p>
      </Card>
    )
  }

  return (
    <Card title="Sleep history" subtitle={`${sessions.length} recent sessions`}>
      <ul className="log-table">
        {sessions.map((s) => {
          const dur = sessionMinutes(s)
          return (
            <li key={s.id} className="log-row">
              <div>
                <span className={`badge badge--${s.kind}`}>{s.kind}</span>
                <div style={{ fontSize: '0.9rem', marginTop: 6, fontWeight: 500 }}>
                  {format(parseISO(s.start), 'EEE, MMM d')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {format(parseISO(s.start), 'h:mm a')}
                  {s.end ? ` – ${format(parseISO(s.end), 'h:mm a')}` : ' · in progress'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {dur !== null && (
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{formatDuration(dur)}</span>
                )}
                <button
                  type="button"
                  className="btn-icon"
                  aria-label="Delete session"
                  onClick={() => onDelete(s.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
