import type { SleepStatus } from '../types'
import type { SleepKind } from '../types'

interface Props {
  status: SleepStatus
  onStart: (kind: SleepKind) => void
  onEnd: () => void
}

export function ActionButtons({ status, onStart, onEnd }: Props) {
  if (status.isAsleep) {
    return (
      <section className="actions">
        <button type="button" className="primary" onClick={onEnd}>
          Wake up
        </button>
      </section>
    )
  }

  return (
    <section className="actions">
      <button type="button" className="secondary nap" onClick={() => onStart('nap')}>
        Start nap
      </button>
      <button type="button" className="secondary night" onClick={() => onStart('night')}>
        Bedtime
      </button>
    </section>
  )
}
