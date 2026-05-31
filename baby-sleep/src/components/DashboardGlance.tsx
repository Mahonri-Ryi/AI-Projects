import type { GlanceSummary } from '../types'

interface Props {
  glance: GlanceSummary
}

export function DashboardGlance({ glance }: Props) {
  return (
    <div className={`glance glance--${glance.kind}`} role="status" aria-live="polite">
      <p className="glance__headline">{glance.headline}</p>
      <p className="glance__subline">{glance.subline}</p>
    </div>
  )
}
