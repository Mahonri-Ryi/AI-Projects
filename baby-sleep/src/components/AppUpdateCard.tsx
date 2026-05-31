import { formatBuildLabel, getBuildId, isProductionBuild } from '../lib/buildInfo'
import { Card } from './ui/Card'

interface Props {
  needRefresh: boolean
  checking: boolean
  checkMessage: string | null
  onCheck: () => void
  onApplyUpdate: () => void
}

export function AppUpdateCard({
  needRefresh,
  checking,
  checkMessage,
  onCheck,
  onApplyUpdate,
}: Props) {
  const buildId = getBuildId()
  const buildLabel = formatBuildLabel(buildId)

  return (
    <Card title="App version" subtitle="Installed app & updates">
      <p className="prose" style={{ marginBottom: '1rem' }}>
        <strong>{buildLabel}</strong>
        {isProductionBuild(buildId) && (
          <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Compare this label after a release — a new short code means an update reached your device.
          </span>
        )}
      </p>

      {needRefresh ? (
        <div className="update-banner update-banner--ready" role="status">
          <p>
            <strong>Update available.</strong> Refresh to get the latest features and fixes.
          </p>
          <button type="button" className="btn btn--primary" onClick={onApplyUpdate}>
            Refresh app
          </button>
        </div>
      ) : (
        <p className="prose" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Little Dream checks for updates when you open the app. If a new version is published, you&apos;ll
          see a notice here.
        </p>
      )}

      <div className="update-actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => void onCheck()}
          disabled={checking}
        >
          {checking ? 'Checking…' : 'Check for updates'}
        </button>
      </div>

      {checkMessage && (
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginTop: '0.75rem',
          }}
        >
          {checkMessage}
        </p>
      )}

      <details className="update-help">
        <summary>Still on an old version?</summary>
        <ul>
          <li>Force-close the app (swipe it away), then open it again.</li>
          <li>On iPhone: open Little Dream in Safari once, then return to the home-screen icon.</li>
          <li>As a last resort: remove the home-screen icon and add the site to your home screen again.</li>
        </ul>
      </details>
    </Card>
  )
}
