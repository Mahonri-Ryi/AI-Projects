import { useState } from 'react'
import type { ChildProfile } from '../types'
import { Card } from './ui/Card'

interface Props {
  children: ChildProfile[]
  activeChildId: string
  onAdd: (name: string, birthDate: string) => void
  onUpdate: (id: string, name: string, birthDate: string) => void
  onRemove: (id: string) => void
  onSelect: (id: string) => void
  startAdding?: boolean
}

export function ChildrenManager({
  children,
  activeChildId,
  onAdd,
  onUpdate,
  onRemove,
  onSelect,
  startAdding = false,
}: Props) {
  const [adding, setAdding] = useState(startAdding)
  const [newName, setNewName] = useState('')
  const [newBirth, setNewBirth] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBirth) return
    onAdd(newName, newBirth)
    setNewName('')
    setNewBirth('')
    setAdding(false)
  }

  return (
    <Card title="Children" subtitle="Each child has separate sleep logs and insights">
      <ul className="children-list">
        {children.map((child) => (
          <ChildRow
            key={child.id}
            child={child}
            isActive={child.id === activeChildId}
            canRemove={children.length > 1}
            onSelect={() => onSelect(child.id)}
            onUpdate={(name, birthDate) => onUpdate(child.id, name, birthDate)}
            onRemove={() => onRemove(child.id)}
          />
        ))}
      </ul>

      {adding ? (
        <form className="child-add-form" onSubmit={handleAdd}>
          <div className="form-field">
            <label htmlFor="new-child-name">Name</label>
            <input
              id="new-child-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Emma"
            />
          </div>
          <div className="form-field">
            <label htmlFor="new-child-birth">Birth date</label>
            <input
              id="new-child-birth"
              type="date"
              value={newBirth}
              onChange={(e) => setNewBirth(e.target.value)}
              required
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="btn-row">
            <button type="submit" className="btn btn--primary">
              Add child
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn--ghost" style={{ width: '100%', marginTop: '0.75rem' }} onClick={() => setAdding(true)}>
          + Add another child
        </button>
      )}
    </Card>
  )
}

function ChildRow({
  child,
  isActive,
  canRemove,
  onSelect,
  onUpdate,
  onRemove,
}: {
  child: ChildProfile
  isActive: boolean
  canRemove: boolean
  onSelect: () => void
  onUpdate: (name: string, birthDate: string) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(child.name)
  const [birthDate, setBirthDate] = useState(child.birthDate)

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!birthDate) return
    onUpdate(name, birthDate)
    setEditing(false)
  }

  return (
    <li className={`children-list__item ${isActive ? 'children-list__item--active' : ''}`}>
      <div className="children-list__header">
        <button
          type="button"
          className="children-list__select"
          onClick={onSelect}
          style={{ '--child-color': child.color } as React.CSSProperties}
        >
          <span className="child-chip__avatar">{(child.name || 'B').charAt(0)}</span>
          <span>
            <strong>{child.name}</strong>
            {isActive && <span className="children-list__badge">Active</span>}
          </span>
        </button>
        <div className="children-list__actions">
          <button type="button" className="btn-icon" onClick={() => setEditing(!editing)}>
            {editing ? 'Done' : 'Edit'}
          </button>
          {canRemove && (
            <button type="button" className="btn-icon" onClick={onRemove}>
              Remove
            </button>
          )}
        </div>
      </div>
      {editing && (
        <form onSubmit={save} className="child-edit-form">
          <div className="form-field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Birth date</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>
            Save
          </button>
        </form>
      )}
    </li>
  )
}
