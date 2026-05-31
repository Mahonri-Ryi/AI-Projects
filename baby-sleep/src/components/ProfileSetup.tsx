import { useState } from 'react'

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
    <form className="card profile-form" onSubmit={handleSubmit}>
      <h2>Baby profile</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Age drives wake-window guidance from pediatric sleep research.
      </p>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="e.g. Luna"
        />
      </div>
      <div className="field">
        <label htmlFor="birth">Birth date</label>
        <input
          id="birth"
          type="date"
          value={localBirth}
          onChange={(e) => setLocalBirth(e.target.value)}
          required
          max={new Date().toISOString().slice(0, 10)}
        />
      </div>
      <button type="submit">Save</button>
    </form>
  )
}
