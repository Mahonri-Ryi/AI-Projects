import { useState } from 'react'
import { Card } from './ui/Card'

interface Props {
  name: string
  birthDate: string
  onSave: (name: string, birthDate: string) => void
}

export function ProfileSetup({ name, birthDate, onSave }: Props) {
  const [localName, setLocalName] = useState(name)
  const [localBirth, setLocalBirth] = useState(birthDate)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!localBirth) return
    onSave(localName.trim() || 'Baby', localBirth)
  }

  return (
    <Card title="Child profile" subtitle="Used for age-based sleep science and analytics">
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Display name</label>
          <input
            id="name"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="e.g. Luna"
          />
        </div>
        <div className="form-field">
          <label htmlFor="birth">Date of birth</label>
          <input
            id="birth"
            type="date"
            value={localBirth}
            onChange={(e) => setLocalBirth(e.target.value)}
            required
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            Save profile
          </button>
        </div>
      </form>
    </Card>
  )
}
