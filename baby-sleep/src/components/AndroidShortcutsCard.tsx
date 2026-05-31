import { Card } from './ui/Card'

const BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL.replace(/\/$/, '')
    : ''

function actionUrl(action: string): string {
  const path = BASE ? `${BASE}/` : '/'
  return `${window.location.origin}${path}?action=${action}`
}

interface Props {
  glanceHeadline?: string
}

export function AndroidShortcutsCard({ glanceHeadline }: Props) {
  const shortcuts = [
    { label: 'Start nap', action: 'start-nap' },
    { label: 'Wake up', action: 'wake' },
    { label: 'Bedtime', action: 'start-bed' },
  ]

  return (
    <Card
      title="Quick actions (Android)"
      subtitle="Long-press the home screen icon after installing"
    >
      {glanceHeadline && (
        <p className="prose" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          At a glance: <strong>{glanceHeadline}</strong>
        </p>
      )}
      <p className="prose" style={{ fontSize: '0.85rem' }}>
        Add this app to your home screen (Chrome → menu → Install app). On Android, long-press the
        icon for <strong>Start nap</strong>, <strong>Wake up</strong>, and <strong>Bedtime</strong>{' '}
        shortcuts. A live widget with the next nap time needs a native app; this PWA shows timing
        when you open it or use shortcuts.
      </p>
      <ul className="shortcuts-list">
        {shortcuts.map((s) => (
          <li key={s.action}>
            <span>{s.label}</span>
            <code className="shortcuts-list__url">{actionUrl(s.action)}</code>
          </li>
        ))}
      </ul>
    </Card>
  )
}
