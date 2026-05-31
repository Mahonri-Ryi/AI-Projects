import { format, parseISO } from 'date-fns'
import type { SleepSession } from '../types'
import { formatDuration } from '../lib/sleepLogic'

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
      <section className="card">
        <h2>Recent sleep</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>No sessions logged yet.</p>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>Recent sleep</h2>
      <ul className="log-list">
        {sessions.map((s) => {
          const dur = sessionMinutes(s)
          return (
            <li key={s.id} className="log-item">
              <div>
                <span className={`badge ${s.kind}`}>{s.kind}</span>
                <div style={{ fontSize: '0.9rem', marginTop: 4 }}>
                  {format(parseISO(s.start), 'MMM d · h:mm a')}
                  {s.end ? ` – ${format(parseISO(s.end), 'h:mm a')}` : ' · ongoing'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {dur !== null && (
                  <span style={{ fontWeight: 600, color: 'var(--accent-dark)' }}>
                    {formatDuration(dur)}
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={() => onDelete(s.id)}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                  }}
                >
                  ✕
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
