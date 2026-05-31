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
      <div className="action-bar">
        <button type="button" className="btn btn--primary" onClick={onEnd}>
          <IconSun size={20} />
          Wake up
        </button>
      </div>
    )
  }

  return (
    <div className="action-bar">
      <button type="button" className="btn btn--nap" onClick={() => onStart('nap')}>
        <IconSun size={18} />
        Start nap
      </button>
      <button type="button" className="btn btn--night" onClick={() => onStart('night')}>
        <IconMoon size={18} />
        Bedtime
      </button>
    </div>
  )
}
