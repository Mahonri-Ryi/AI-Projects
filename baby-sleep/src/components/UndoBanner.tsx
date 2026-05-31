interface Props {
  label: string
  secondsLeft: number
  onUndo: () => void
}

export function UndoBanner({ label, secondsLeft, onUndo }: Props) {
  if (secondsLeft <= 0) return null

  return (
    <div className="inline-banner inline-banner--undo" role="status" aria-live="polite">
      <p>
        {label} · <span className="inline-banner__timer">{secondsLeft}s</span>
      </p>
      <button type="button" className="btn btn--primary btn--compact" onClick={onUndo}>
        Undo
      </button>
    </div>
  )
}
