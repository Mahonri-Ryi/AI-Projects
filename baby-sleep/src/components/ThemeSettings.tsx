import type { ThemePreference } from '../lib/theme'
import { Card } from './ui/Card'
import { IconMoon, IconSun } from './icons'

interface Props {
  preference: ThemePreference
  onChange: (pref: ThemePreference) => void
}

const OPTIONS: { id: ThemePreference; label: string; hint: string }[] = [
  { id: 'light', label: 'Light', hint: 'Always light' },
  { id: 'dark', label: 'Dark', hint: 'Always dark' },
  { id: 'system', label: 'System', hint: 'Match device' },
]

export function ThemeSettings({ preference, onChange }: Props) {
  return (
    <Card title="Appearance" subtitle="Choose how Little Dream looks on your device">
      <div className="theme-picker" role="radiogroup" aria-label="Theme">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={preference === opt.id}
            className={`theme-picker__option ${preference === opt.id ? 'theme-picker__option--active' : ''}`}
            onClick={() => onChange(opt.id)}
          >
            <span className="theme-picker__icon" aria-hidden>
              {opt.id === 'dark' ? <IconMoon size={18} /> : <IconSun size={18} />}
            </span>
            <span className="theme-picker__label">{opt.label}</span>
            <span className="theme-picker__hint">{opt.hint}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}
