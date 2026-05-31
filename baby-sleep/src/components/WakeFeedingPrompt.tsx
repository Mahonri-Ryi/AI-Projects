import { FEEDING_TAG_LABELS, type FeedingTag } from '../types'

const TAGS: FeedingTag[] = ['breast', 'bottle', 'solids']

interface Props {
  onSelect: (tags: FeedingTag[]) => void
  onSkip: () => void
}

export function WakeFeedingPrompt({ onSelect, onSkip }: Props) {
  return (
    <div className="inline-banner inline-banner--feeding" role="group" aria-label="Optional feeding context">
      <p>Optional: feeding before this sleep?</p>
      <div className="feeding-tags">
        {TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            className="btn btn--ghost btn--compact"
            onClick={() => onSelect([tag])}
          >
            {FEEDING_TAG_LABELS[tag]}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn--ghost btn--compact" onClick={onSkip}>
        Skip
      </button>
    </div>
  )
}
