import { IconMoon, IconSun } from './icons'
import type { SleepStatus, SleepKind } from '../types'

interface Props {
  status: SleepStatus
  onStart: (kind: SleepKind) => void
  onEnd: () => void
}

export function ActionButtons({ status, onStart, onEnd }: Props) {
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
