import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { FEEDING_TAG_LABELS, type FeedingTag, type SleepSession } from '../types'
import { formatDuration } from '../lib/sleepLogic'
import { Card } from './ui/Card'
import { SessionEditor } from './SessionEditor'

interface Props {
  sessions: SleepSession[]
  onUpdate: (
    id: string,
    patch: Partial<Pick<SleepSession, 'kind' | 'start' | 'end' | 'feedingTags'>>,
  ) => void
  onDelete: (id: string) => void
}

function sessionMinutes(s: SleepSession): number | null {
  if (!s.end) return null
  return Math.round(
    (parseISO(s.end).getTime() - parseISO(s.start).getTime()) / 60_000,
  )
}

export function SleepLog({ sessions, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = editingId ? sessions.find((s) => s.id === editingId) : null

  if (editing) {
    return (
      <SessionEditor
        session={editing}
        onSave={(patch) => {
          onUpdate(editing.id, patch)
          setEditingId(null)
        }}
        onCancel={() => setEditingId(null)}
      />
    )
  }

  if (sessions.length === 0) {
    return (
      <Card title="Sleep history" subtitle="All logged sessions">
        <p className="prose">No sessions yet. Log naps and bedtime from the Dashboard.</p>
      </Card>
    )
  }

  return (
    <Card title="Sleep history" subtitle={`${sessions.length} recent sessions · tap Edit to fix times`}>
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
                {s.feedingTags && s.feedingTags.length > 0 && (
                  <div className="log-feeding-tags">
                    {s.feedingTags.map((t: FeedingTag) => (
                      <span key={t} className="badge badge--muted">
                        {FEEDING_TAG_LABELS[t]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {dur !== null && (
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{formatDuration(dur)}</span>
                )}
                <button
                  type="button"
                  className="btn btn--ghost btn--compact"
                  onClick={() => setEditingId(s.id)}
                >
                  Edit
                </button>
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
