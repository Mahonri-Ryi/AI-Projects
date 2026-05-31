import type { ForgotToLogPrompt } from '../lib/forgotToLog'

interface Props {
  prompt: ForgotToLogPrompt
  onDismiss?: () => void
}

export function ForgotToLogBanner({ prompt, onDismiss }: Props) {
  return (
    <div className="inline-banner inline-banner--watch" role="status">
      <p>{prompt.message}</p>
      {onDismiss && (
        <button type="button" className="btn btn--ghost btn--compact" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  )
}
