import type { ScienceSource } from '../../types'

interface Props {
  sources: ScienceSource[]
  title?: string
  compact?: boolean
}

export function ResearchLinks({ sources, title = 'Research behind this', compact }: Props) {
  if (sources.length === 0) return null

  return (
    <div className={`research-links ${compact ? 'research-links--compact' : ''}`}>
      <p className="research-links__title">{title}</p>
      <ul className="research-links__list">
        {sources.map((s) => (
          <li key={s.id ?? s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title}
              <span className="research-links__external" aria-hidden>
                ↗
              </span>
            </a>
            {s.note && !compact && <span className="research-links__note">{s.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
