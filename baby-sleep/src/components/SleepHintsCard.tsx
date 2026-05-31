import type { SleepHint } from '../types'
import { Card } from './ui/Card'

interface Props {
  hints: SleepHint[]
}

export function SleepHintsCard({ hints }: Props) {
  if (hints.length === 0) return null

  return (
    <Card title="Today’s cues" subtitle="Pattern hints from your log">
      <ul className="hints-list">
        {hints.map((h) => (
          <li key={h.id} className={`hints-list__item hints-list__item--${h.severity}`}>
            <strong>{h.title}</strong>
            <p>{h.body}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}
