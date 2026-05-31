import { format } from 'date-fns'
import type { TimelineBlock } from '../../lib/analytics'

interface Props {
  blocks: TimelineBlock[]
  dateLabel: string
}

export function DayTimeline({ blocks, dateLabel }: Props) {
  return (
    <div className="day-timeline">
      <div className="day-timeline__labels">
        <span>12a</span>
        <span>6a</span>
        <span>12p</span>
        <span>6p</span>
        <span>12a</span>
      </div>
      <div className="day-timeline__track" role="img" aria-label={`Sleep timeline for ${dateLabel}`}>
        {blocks.map((b, i) => {
          const width = ((b.endHour - b.startHour) / 24) * 100
          const left = (b.startHour / 24) * 100
          return (
            <div
              key={`${b.kind}-${i}`}
              className={`day-timeline__block day-timeline__block--${b.kind}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${b.kind} ${formatHour(b.startHour)}–${formatHour(b.endHour)}`}
            />
          )
        })}
      </div>
      <p className="day-timeline__caption">{dateLabel} · 24-hour view</p>
    </div>
  )
}

function formatHour(h: number): string {
  const hr = Math.floor(h) % 24
  const m = Math.round((h % 1) * 60)
  const ap = hr >= 12 ? 'PM' : 'AM'
  const h12 = hr % 12 || 12
  return m > 0 ? `${h12}:${String(m).padStart(2, '0')} ${ap}` : `${h12} ${ap}`
}

export function TodayTimelineHeader({ now }: { now: Date }) {
  return format(now, 'EEEE, MMM d')
}
