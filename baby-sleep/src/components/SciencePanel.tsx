import type { WakeWindowGuidance } from '../types'

interface Props {
  guidance: WakeWindowGuidance | null
  ageLabel: string | null
}

export function SciencePanel({ guidance, ageLabel }: Props) {
  if (!guidance) {
    return (
      <section className="card science">
        <h2>Research</h2>
        <p>Add your baby&apos;s birth date to see age-specific guidance.</p>
      </section>
    )
  }

  return (
    <section className="card science">
      <h2>Science behind the guidance</h2>
      {ageLabel && (
        <p>
          <strong>{ageLabel}</strong> — {guidance.ageLabel}
        </p>
      )}

      <h3 style={{ fontSize: '1rem', marginTop: '1rem' }}>Wake window (this age)</h3>
      <p>
        {guidance.minMinutes}–{guidance.maxMinutes} minutes awake between sleeps. Target used for
        predictions: ~{guidance.targetMinutes} minutes (mid-range; adjust for cues).
      </p>

      <h3 style={{ fontSize: '1rem' }}>Total sleep (24 hours)</h3>
      <p>
        Typical range: {guidance.totalSleepHours.min}–{guidance.totalSleepHours.max} hours. Needs
        vary — this is a population guide, not a prescription.
      </p>

      <h3 style={{ fontSize: '1rem' }}>Naps</h3>
      <p>{guidance.napCountHint}</p>

      <h3 style={{ fontSize: '1rem' }}>How we predict “next nap”</h3>
      <ul>
        <li>
          <strong>Homeostatic sleep pressure</strong> builds while awake; younger babies need
          shorter wake times (Cleveland Clinic; sleep medicine reviews).
        </li>
        <li>
          <strong>Circadian rhythm</strong> matures around 3–4 months — naps become more
          predictable; keep bedtime fairly stable after ~3 months (Baby Sleep Science).
        </li>
        <li>
          We shorten or lengthen the target slightly if the last nap was very short/long or
          daytime sleep is low — still watch <em>your</em> baby&apos;s cues first.
        </li>
      </ul>

      <h3 style={{ fontSize: '1rem' }}>Sources</h3>
      <ul>
        {guidance.sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title}
            </a>
            {s.note && (
              <>
                <br />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.note}</span>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="disclaimer">
        This app is for family tracking and education — not medical advice. If you have concerns
        about breathing, feeding, or development, contact your pediatrician. Every baby is
        different; ranges are guides, not rules.
      </div>
    </section>
  )
}
