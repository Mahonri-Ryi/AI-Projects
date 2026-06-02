import { useState } from 'react'
import { differenceInMinutes, format, parseISO } from 'date-fns'
import { FEEDING_TAG_LABELS, type FeedingTag, type NightWake, type SleepSession } from '../types'
import { formatDuration } from '../lib/sleepLogic'
import { wakesForNightSession } from '../lib/nightWake'
import { Card } from './ui/Card'
import { buildManualSessionDraft } from '../lib/sessionDraft'
import { SessionEditor } from './SessionEditor'

const CREATE_ID = '__create__'

interface Props {
  sessions: SleepSession[]
  nightWakes: NightWake[]
  childId: string
  hasOpenSession: boolean
  onAdd: (patch: Omit<SleepSession, 'id' | 'childId'>) => boolean
  onUpdate: (
    id: string,
    patch: Partial<Pick<SleepSession, 'kind' | 'start' | 'end' | 'feedingTags'>>,
  ) => void
  onDelete: (id: string) => void
  onDeleteNightWake: (id: string) => void
}

function sessionMinutes(s: SleepSession): number | null {
  if (!s.end) return null
  return Math.round(
    (parseISO(s.end).getTime() - parseISO(s.start).getTime()) / 60_000,
  )
}

function nightWakeMinutes(w: NightWake): number | null {
  if (!w.end) return null
  return differenceInMinutes(parseISO(w.end), parseISO(w.start))
}

export function SleepLog({
  sessions,
  nightWakes,
  childId,
  hasOpenSession,
  onAdd,
  onUpdate,
  onDelete,
  onDeleteNightWake,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addError, setAddError] = useState('')

  const editing = editingId === CREATE_ID
    ? buildManualSessionDraft(childId)
    : editingId
      ? sessions.find((s) => s.id === editingId)
      : null

  const openAddForm = () => {
    setAddError('')
    setEditingId(CREATE_ID)
  }

  if (editing) {
    return (
      <>
        {addError && (
          <p className="coach-error" style={{ marginBottom: '0.75rem' }}>
            {addError}
          </p>
        )}
        <SessionEditor
          session={editing}
          mode={editingId === CREATE_ID ? 'create' : 'edit'}
          onSave={(patch) => {
            if (editingId === CREATE_ID) {
              if (patch.end === null && hasOpenSession) {
                setAddError('End the current sleep session on the Dashboard before adding another in progress.')
                return
              }
              const added = onAdd(patch)
              if (!added) {
                setAddError('Could not add session. Check times or end the open session first.')
                return
              }
            } else {
              onUpdate(editing.id, patch)
            }
            setEditingId(null)
            setAddError('')
          }}
          onCancel={() => {
            setEditingId(null)
            setAddError('')
          }}
        />
      </>
    )
  }

  const addButton = (
    <button type="button" className="btn btn--primary btn--compact" onClick={openAddForm}>
      Add session
    </button>
  )

  if (sessions.length === 0) {
    return (
      <Card
        title="Sleep history"
        subtitle="Backfill naps and bedtime you forgot to log"
        action={addButton}
      >
        <p className="prose">
          No sessions yet. Tap <strong>Add session</strong> to log a past nap or bedtime, or use the
          Dashboard to start one live.
        </p>
      </Card>
    )
  }

  return (
    <Card
      title="Sleep history"
      subtitle={`${sessions.length} recent sessions`}
      action={addButton}
    >
      <p className="prose" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
        Tap <strong>Add session</strong> for a forgotten log, or <strong>Edit</strong> to fix times.
      </p>
      <ul className="log-table">
        {sessions.map((s) => {
          const dur = sessionMinutes(s)
          const wakes =
            s.kind === 'night' ? wakesForNightSession(nightWakes, s.id) : []
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
                {wakes.length > 0 && (
                  <ul className="log-night-wakes">
                    {wakes.map((w) => {
                      const wDur = nightWakeMinutes(w)
                      return (
                        <li key={w.id} className="log-night-wake-row">
                          <span className="badge badge--muted">night wake</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {format(parseISO(w.start), 'h:mm a')}
                            {w.end ? ` – ${format(parseISO(w.end), 'h:mm a')}` : ' · in progress'}
                            {wDur != null ? ` · ${formatDuration(wDur)}` : ''}
                          </span>
                          <button
                            type="button"
                            className="btn-icon"
                            aria-label="Remove night wake"
                            onClick={() => onDeleteNightWake(w.id)}
                          >
                            ×
                          </button>
                        </li>
                      )
                    })}
                  </ul>
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
