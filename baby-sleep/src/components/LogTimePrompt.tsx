import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fromLocalDateTimeInput, toLocalDateTimeInput } from '../lib/localDateTime'
import type { LogTimePromptKind } from '../lib/logTimePrompt'
import { Card } from './ui/Card'

export type { LogTimePromptKind } from '../lib/logTimePrompt'

const COPY: Record<
  LogTimePromptKind,
  { title: string; subtitle: string; confirm: string; minAfterLabel: string }
> = {
  'start-nap': {
    title: 'When did the nap start?',
    subtitle: 'Use now if you’re logging right away, or set when sleep actually started.',
    confirm: 'Log nap start',
    minAfterLabel: 'Nap cannot start more than 3 days ago.',
  },
  'start-bedtime': {
    title: 'When did bedtime start?',
    subtitle: 'Use now if you’re logging right away, or set when she actually fell asleep.',
    confirm: 'Log bedtime',
    minAfterLabel: 'Bedtime cannot start more than 3 days ago.',
  },
  'wake-nap': {
    title: 'When did she wake up?',
    subtitle: 'Use now or set when the nap actually ended.',
    confirm: 'Log wake up',
    minAfterLabel: 'Wake time must be after the nap started.',
  },
  'wake-morning': {
    title: 'When did she wake up?',
    subtitle: 'Use now or set when she actually woke for the day.',
    confirm: 'Log morning wake',
    minAfterLabel: 'Wake time must be after bedtime started.',
  },
  'night-wake-start': {
    title: 'When did she wake up?',
    subtitle: 'Use now if you’re logging right away, or set the time she actually woke.',
    confirm: 'Log wake-up',
    minAfterLabel: 'Wake time must be after bedtime started.',
  },
  'night-wake-end': {
    title: 'When did she fall back asleep?',
    subtitle: 'Use now if you’re logging right away, or set when she went back down.',
    confirm: 'Log back to sleep',
    minAfterLabel: 'Back to sleep must be after this wake started.',
  },
}

interface Props {
  kind: LogTimePromptKind
  now: Date
  minTime: Date
  maxTime?: Date
  onConfirm: (iso: string) => void
  onCancel: () => void
}

export function LogTimePrompt({ kind, now, minTime, maxTime, onConfirm, onCancel }: Props) {
  const max = maxTime ?? now
  const copy = COPY[kind]
  const [custom, setCustom] = useState(toLocalDateTimeInput(now.toISOString()))
  const [error, setError] = useState('')

  const validate = (iso: string): string | null => {
    const t = parseISO(iso).getTime()
    if (t > max.getTime() + 60_000) return 'Time cannot be in the future.'
    if (t < minTime.getTime()) return copy.minAfterLabel
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
    <Card title={copy.title} subtitle={copy.subtitle} className="log-time-prompt">
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
          {copy.confirm}
        </button>
      </div>
    </Card>
  )
}
