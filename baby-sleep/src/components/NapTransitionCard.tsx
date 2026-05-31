import type { NapTransitionTip } from '../lib/napTransitions'
import { Card } from './ui/Card'

interface Props {
  tip: NapTransitionTip
}

export function NapTransitionCard({ tip }: Props) {
  return (
    <Card title={tip.title} subtitle="Age-based nap schedule cues">
      <p className="prose" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
        Signs your baby may be ready:
      </p>
      <ul className="report-highlights">
        {tip.signs.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="prose" style={{ fontSize: '0.85rem', margin: '1rem 0 0.5rem' }}>
        What helps:
      </p>
      <ul className="report-highlights">
        {tip.tips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </Card>
  )
}
