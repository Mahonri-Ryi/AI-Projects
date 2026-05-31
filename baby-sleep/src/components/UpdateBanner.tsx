interface Props {
  onApplyUpdate: () => void
}

export function UpdateBanner({ onApplyUpdate }: Props) {
  return (
    <div className="update-banner update-banner--sticky" role="status">
      <p>
        <strong>Update ready</strong> — refresh for the latest Little Dream.
      </p>
      <button type="button" className="btn btn--primary btn--compact" onClick={onApplyUpdate}>
        Refresh
      </button>
    </div>
  )
}
