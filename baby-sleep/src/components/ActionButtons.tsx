import { IconMoon, IconSun } from './icons'
import type { SleepStatus, SleepKind } from '../types'

interface Props {
  status: SleepStatus
  onStart: (kind: SleepKind) => void
  onEnd: () => void
  onStartNightWake: () => void
  onEndNightWake: () => void
}

export function ActionButtons({
  status,
  onStart,
  onEnd,
  onStartNightWake,
  onEndNightWake,
}: Props) {
  const isNightSession = status.currentSession?.kind === 'night' || status.openNightSession

  if (status.activeNightWake) {
    return (
      <div className="action-bar action-bar--primary action-bar--night" role="group" aria-label="Night wake actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onEndNightWake}
          aria-label="Baby back to sleep"
        >
          <IconMoon size={20} aria-hidden />
          Back to sleep
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onEnd}
          aria-label="Morning wake up"
        >
          <IconSun size={18} aria-hidden />
          Wake up (morning)
        </button>
      </div>
    )
  }

  if (status.isAsleep && isNightSession) {
    return (
      <div className="action-bar action-bar--primary action-bar--night" role="group" aria-label="Night sleep actions">
        <button
          type="button"
          className="btn btn--night"
          onClick={onStartNightWake}
          aria-label="Up for feed or resettle"
        >
          <IconSun size={18} aria-hidden />
          Up for feed / resettle
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onEnd}
          aria-label="Morning wake up"
        >
          Wake up (morning)
        </button>
      </div>
    )
  }

  if (status.isAsleep) {
    return (
      <div className="action-bar action-bar--primary" role="group" aria-label="Sleep actions">
        <button type="button" className="btn btn--primary" onClick={onEnd} aria-label="Mark baby awake">
          <IconSun size={20} aria-hidden />
          Wake up
        </button>
      </div>
    )
  }

  return (
    <div className="action-bar action-bar--primary" role="group" aria-label="Start sleep">
      <button
        type="button"
        className="btn btn--nap"
        onClick={() => onStart('nap')}
        aria-label="Start nap"
      >
        <IconSun size={18} aria-hidden />
        Start nap
      </button>
      <button
        type="button"
        className="btn btn--night"
        onClick={() => onStart('night')}
        aria-label="Start bedtime"
      >
        <IconMoon size={18} aria-hidden />
        Bedtime
      </button>
    </div>
  )
}
