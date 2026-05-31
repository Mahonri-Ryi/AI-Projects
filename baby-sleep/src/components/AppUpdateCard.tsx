import { formatBuildLabel, getBuildId, isProductionBuild } from '../lib/buildInfo'
import { Card } from './ui/Card'

interface Props {
  needRefresh: boolean
  remoteBuildLabel: string | null
  checking: boolean
  cacheRefreshing: boolean
  checkMessage: string | null
  onCheck: () => void
  onApplyUpdate: () => void
  onClearCache: () => void
}

export function AppUpdateCard({
  needRefresh,
  remoteBuildLabel,
  checking,
  cacheRefreshing,
  checkMessage,
  onCheck,
  onApplyUpdate,
  onClearCache,
}: Props) {
  const buildId = getBuildId()
  const buildLabel = formatBuildLabel(buildId)

  return (
    <Card title="App version" subtitle="Installed app & updates">
      <p className="prose" style={{ marginBottom: '1rem' }}>
        <strong>{buildLabel}</strong>
        {isProductionBuild(buildId) && (
          <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            This device is running build <code>{buildId.slice(0, 7)}</code>.
            {remoteBuildLabel && remoteBuildLabel !== buildLabel && (
              <> A newer build ({remoteBuildLabel}) is on the server.</>
            )}
          </span>
        )}
      </p>

      {needRefresh ? (
        <div className="update-banner update-banner--ready" role="status">
          <p>
            <strong>Update available.</strong>
            {remoteBuildLabel ? ` ${remoteBuildLabel} is ready.` : ' Refresh to get the latest features.'}
          </p>
          <div className="update-actions">
            <button type="button" className="btn btn--primary" onClick={onApplyUpdate}>
              Refresh app
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={cacheRefreshing}
              onClick={onClearCache}
            >
              {cacheRefreshing ? 'Resetting…' : 'Clear cache & reload'}
            </button>
          </div>
        </div>
      ) : (
        <p className="prose" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Little Dream checks for updates when you open the app. Your sleep logs are kept on this
          phone — clearing cache does not delete them.
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
        {!needRefresh && (
          <button
            type="button"
            className="btn btn--ghost"
            disabled={cacheRefreshing}
            onClick={onClearCache}
          >
            {cacheRefreshing ? 'Resetting…' : 'Clear cache & reload'}
          </button>
        )}
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
        <summary>Stuck on an old version?</summary>
        <ul>
          <li>
            Tap <strong>Clear cache & reload</strong> — this fixes most stale installs and{' '}
            <strong>keeps your sleep data</strong> (unlike deleting the app).
          </li>
          <li>Force-close the app, then open it again while online.</li>
          <li>
            Compare the build code above with a fresh open in Safari:{' '}
            <a href="https://mahonri-ryi.github.io/AI-Projects/baby-sleep/" target="_blank" rel="noopener noreferrer">
              mahonri-ryi.github.io/AI-Projects/baby-sleep/
            </a>
          </li>
          <li>Only if needed: remove the home-screen icon and add it again (data is preserved in Safari).</li>
        </ul>
      </details>
    </Card>
  )
}
