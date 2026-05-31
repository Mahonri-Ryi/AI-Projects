interface Props {
  onApplyUpdate: () => void
  onClearCache: () => void
}

export function UpdateBanner({ onApplyUpdate, onClearCache }: Props) {
  return (
    <div className="update-banner update-banner--sticky" role="status">
      <p>
        <strong>Update ready</strong> — refresh for the latest Little Dream.
      </p>
      <div className="update-actions">
        <button type="button" className="btn btn--primary btn--compact" onClick={onApplyUpdate}>
          Refresh
        </button>
        <button type="button" className="btn btn--ghost btn--compact" onClick={onClearCache}>
          Clear cache
        </button>
      </div>
    </div>
  )
}
