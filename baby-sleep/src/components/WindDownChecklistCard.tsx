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
      <div className="wind-checklist-tabs" role="tablist" aria-label="Checklist type">
        {(['nap', 'bed'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            className={tab === k ? 'wind-checklist-tabs__btn--active' : ''}
            onClick={() => setTab(k)}
          >
            {k === 'nap' ? 'Pre-nap' : 'Pre-bed'}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="wind-checklist-empty">No steps yet — add one below.</p>
      ) : (
        <ul className="wind-checklist">
          {items.map((item) => {
            const checked = checklist.checkedIds.includes(item.id)
            return (
              <li
                key={item.id}
                className={`wind-checklist__item${checked ? ' wind-checklist__item--done' : ''}`}
              >
                <label className="wind-checklist__label">
                  <input
                    type="checkbox"
                    className="wind-checklist__checkbox"
                    checked={checked}
                    onChange={() => onToggle(item.id)}
                  />
                  <span className="wind-checklist__text">{item.label}</span>
                </label>
                <button
                  type="button"
                  className="wind-checklist__remove"
                  aria-label={`Remove ${item.label}`}
                  onClick={() => onRemove(item.id)}
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="wind-checklist-add">
        <input
          type="text"
          className="wind-checklist-add__input"
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
