import { useState } from 'react'
import type { WindDownChecklistState } from '../types'
import { Card } from './ui/Card'

interface Props {
  checklist: WindDownChecklistState
  onToggle: (itemId: string) => void
  onAdd: (kind: 'nap' | 'bed', label: string) => void
  onRemove: (itemId: string) => void
}

export function WindDownChecklistCard({ checklist, onToggle, onAdd, onRemove }: Props) {
  const [tab, setTab] = useState<'nap' | 'bed'>('nap')
  const [newLabel, setNewLabel] = useState('')

  const items = checklist.items.filter((i) => i.kind === tab)

  const addItem = () => {
    if (!newLabel.trim()) return
    onAdd(tab, newLabel)
    setNewLabel('')
  }

  return (
    <Card title="Wind-down checklist" subtitle="Tap steps before nap or bedtime">
      <div className="range-toggle" role="tablist" aria-label="Checklist type">
        {(['nap', 'bed'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            className={tab === k ? 'range-toggle__btn--active' : ''}
            onClick={() => setTab(k)}
          >
            {k === 'nap' ? 'Pre-nap' : 'Pre-bed'}
          </button>
        ))}
      </div>
      <ul className="checklist">
        {items.map((item) => (
          <li key={item.id}>
            <label className="checklist__row">
              <input
                type="checkbox"
                checked={checklist.checkedIds.includes(item.id)}
                onChange={() => onToggle(item.id)}
              />
              <span>{item.label}</span>
            </label>
            <button
              type="button"
              className="btn-icon"
              aria-label={`Remove ${item.label}`}
              onClick={() => onRemove(item.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="checklist-add">
        <input
          type="text"
          placeholder="Add step…"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button type="button" className="btn btn--ghost btn--compact" onClick={addItem}>
          Add
        </button>
      </div>
    </Card>
  )
}
