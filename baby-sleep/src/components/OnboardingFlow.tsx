import { useState } from 'react'
import { Card } from './ui/Card'

interface Props {
  childName: string
  onComplete: (name: string, birthDate: string) => void
  onSkip: () => void
}

export function OnboardingFlow({ childName, onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(childName === 'Baby' ? '' : childName)
  const [birthDate, setBirthDate] = useState('')

  const steps = [
    {
      title: 'Welcome to Little Dream',
      body: 'Track naps and bedtime, get research-based timing, and spot patterns — all on your phone.',
    },
    {
      title: 'Who are we tracking?',
      body: 'Add your baby’s name and birth date for age-based nap and bedtime guidance.',
    },
    {
      title: 'Log with one tap',
      body: 'Use Start nap and Bedtime at the top of the Dashboard. Tap Wake up when sleep ends.',
    },
  ]

  if (step < 2) {
    return (
      <div className="onboarding-overlay" role="dialog" aria-label="Welcome to Little Dream">
        <Card title={steps[step].title} subtitle={`Step ${step + 1} of 3`}>
          <p className="prose">{steps[step].body}</p>
          <div className="btn-row" style={{ marginTop: '1.25rem' }}>
            {step > 0 && (
              <button type="button" className="btn btn--ghost" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            <button type="button" className="btn btn--primary" onClick={() => setStep(step + 1)}>
              Continue
            </button>
          </div>
          <button type="button" className="btn btn--ghost" style={{ width: '100%', marginTop: '0.5rem' }} onClick={onSkip}>
            Skip for now
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="onboarding-overlay" role="dialog" aria-label="Set up child profile">
      <Card title="Child profile" subtitle="Step 3 of 3">
        <label className="form-field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Baby’s name" />
        </label>
        <label className="form-field">
          <span>Birth date</span>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </label>
        <button
          type="button"
          className="btn btn--primary"
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={!birthDate}
          onClick={() => onComplete(name.trim() || 'Baby', birthDate)}
        >
          Start tracking
        </button>
      </Card>
    </div>
  )
}
