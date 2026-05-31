import type { ChildProfile, WakeWindowGuidance } from '../types'
import { Card } from './ui/Card'

interface Props {
  child: ChildProfile
  guidance: WakeWindowGuidance | null
  onChange: (routine: { customWakeTargetMinutes?: number; preferredBedtimeMinutes?: number }) => void
}

function minutesToTimeInput(mins?: number): string {
  if (mins == null) return ''
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function timeInputToMinutes(value: string): number | undefined {
  if (!value) return undefined
  const [h, m] = value.split(':').map(Number)
  return h * 60 + m
}

export function ChildRoutineSettings({ child, guidance, onChange }: Props) {
  const wake =
    child.routine?.customWakeTargetMinutes != null
      ? String(child.routine.customWakeTargetMinutes)
      : ''
  const bed = minutesToTimeInput(child.routine?.preferredBedtimeMinutes)

  return (
    <Card
      title={`Routine · ${child.name}`}
      subtitle="Optional overrides (age guidance still shown)"
    >
      <label className="form-field">
        <span>Target wake window (minutes)</span>
        <input
          type="number"
          min={30}
          max={360}
          placeholder={guidance ? String(guidance.targetMinutes) : '90'}
          value={wake}
          onChange={(e) =>
            onChange({
              customWakeTargetMinutes: e.target.value ? Number(e.target.value) : undefined,
              preferredBedtimeMinutes: child.routine?.preferredBedtimeMinutes,
            })
          }
        />
      </label>
      <label className="form-field">
        <span>Preferred bedtime</span>
        <input
          type="time"
          value={bed}
          onChange={(e) =>
            onChange({
              customWakeTargetMinutes: child.routine?.customWakeTargetMinutes,
              preferredBedtimeMinutes: timeInputToMinutes(e.target.value),
            })
          }
        />
      </label>
      <p className="prose" style={{ fontSize: '0.85rem' }}>
        Leave blank to use age-based defaults. Overrides affect nap and bedtime suggestions only.
      </p>
    </Card>
  )
}
