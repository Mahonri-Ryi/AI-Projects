import type { WakeWindowGuidance } from '../types'
import { Card } from './ui/Card'

interface Props {
  guidance: WakeWindowGuidance | null
  ageLabel: string | null
}

export function SciencePanel({ guidance, ageLabel }: Props) {
  if (!guidance) {
    return (
      <Card title="Clinical guide" subtitle="Evidence-based sleep reference">
        <p className="prose">Complete the child profile to view age-specific recommendations.</p>
      </Card>
    )
  }

  return (
    <>
      <Card title="Clinical guide" subtitle={ageLabel ? `${ageLabel} · ${guidance.ageLabel}` : guidance.ageLabel}>
        <div className="stat-grid" style={{ marginBottom: '0.5rem' }}>
          <div className="guide-chip">
            <strong style={{ display: 'block', color: 'var(--text)' }}>Wake window</strong>
            {guidance.minMinutes}–{guidance.maxMinutes} min
          </div>
          <div className="guide-chip">
            <strong style={{ display: 'block', color: 'var(--text)' }}>Daily sleep</strong>
            {guidance.totalSleepHours.min}–{guidance.totalSleepHours.max} h
          </div>
        </div>
        <p className="prose" style={{ marginTop: '1rem' }}>{guidance.napCountHint}</p>
      </Card>

      <Card title="Methodology" subtitle="How recommendations are calculated">
        <div className="prose">
          <h3>Sleep pressure &amp; circadian rhythm</h3>
          <p>
            Wake windows reflect homeostatic sleep pressure — how long your baby can comfortably stay
            awake before needing rest. Circadian rhythm matures around 3–4 months, making patterns more
            predictable.
          </p>
          <h3>Next-nap algorithm</h3>
          <ul>
            <li>Mid-range wake window for your baby&apos;s age band</li>
            <li>Adjustments for unusually short or long prior naps</li>
            <li>Daytime sleep deficit may suggest earlier naps</li>
          </ul>
          <h3>Peer-reviewed sources</h3>
          <ul>
            {guidance.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
                {s.note && (
                  <>
                    <br />
                    <span style={{ fontSize: '0.8rem' }}>{s.note}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="disclaimer">
          For educational and tracking purposes only — not medical advice. Consult your pediatrician for
          concerns about breathing, feeding, growth, or development.
        </div>
      </Card>
    </>
  )
}
