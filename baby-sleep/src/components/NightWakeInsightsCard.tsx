import type { NightWake } from '../types'
import { generateNightWakeInsights } from '../lib/nightWakeInsights'
import { Card } from './ui/Card'

interface Props {
  nightWakes: NightWake[]
  childId: string
  now: Date
}

export function NightWakeInsightsCard({ nightWakes, childId, now }: Props) {
  const insights = generateNightWakeInsights(nightWakes, childId, now)
  if (insights.length === 0) return null

  return (
    <Card title="Night wakes" subtitle="Last 14 days">
      <ul className="insight-list">
        {insights.map((item) => (
          <li key={item.id} className={`insight-item insight-item--${item.type}`}>
            <div>
              <strong>{item.title}</strong>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
