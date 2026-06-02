import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fromLocalDateTimeInput, toLocalDateTimeInput } from '../lib/localDateTime'
import { Card } from './ui/Card'

export type NightWakeTimePromptKind = 'start' | 'end'

interface Props {
  kind: NightWakeTimePromptKind
  now: Date
  /** Earliest allowed time (bedtime start or wake start). */
  minTime: Date
  /** Latest allowed time (usually now). */
  maxTime?: Date
  onConfirm: (iso: string) => void
  onCancel: () => void
}

export function NightWakeTimePrompt({
  kind,
  now,
  minTime,
  maxTime,
  onConfirm,
  onCancel,
}: Props) {
  const max = maxTime ?? now
  const [custom, setCustom] = useState(toLocalDateTimeInput(now.toISOString()))
  const [error, setError] = useState('')

  const title = kind === 'start' ? 'When did she wake up?' : 'When did she fall back asleep?'
  const subtitle =
    kind === 'start'
      ? 'Use now if you’re logging right away, or set the time she actually woke.'
      : 'Use now if you’re logging right away, or set when she went back down.'

  const validate = (iso: string): string | null => {
    const t = parseISO(iso).getTime()
    if (t > max.getTime() + 60_000) return 'Time cannot be in the future.'
    if (t < minTime.getTime()) {
      return kind === 'start'
        ? 'Wake time must be after bedtime started.'
        : 'Back to sleep must be after this wake started.'
    }
    return null
  }

  const submit = (iso: string) => {
    const msg = validate(iso)
    if (msg) {
      setError(msg)
      return
    }
    setError('')
    onConfirm(iso)
  }

  return (
    <Card title={title} subtitle={subtitle} className="night-wake-time-prompt">
      <div className="btn-row" style={{ marginBottom: '1rem' }}>
        <button type="button" className="btn btn--primary" onClick={() => submit(now.toISOString())}>
          Use now ({format(now, 'h:mm a')})
        </button>
      </div>

      <label className="form-field">
        <span>Or set time</span>
        <input
          type="datetime-local"
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value)
            setError('')
          }}
        />
      </label>

      {error && <p className="coach-error">{error}</p>}

      <div className="btn-row" style={{ marginTop: '1rem' }}>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => submit(fromLocalDateTimeInput(custom))}
        >
          {kind === 'start' ? 'Log wake-up' : 'Log back to sleep'}
        </button>
      </div>
    </Card>
  )
}
