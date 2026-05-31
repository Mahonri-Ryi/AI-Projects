import { Card } from './ui/Card'

export function CloudFeaturesCard() {
  return (
    <Card title="Coming soon" subtitle="Features that need cloud sync">
      <ul className="privacy-list">
        <li>
          <strong>Push when app is closed:</strong> Reliable background alerts need a small cloud service.
          Today, reminders work via your phone’s notification permission while the app is open or recent.
        </li>
        <li>
          <strong>Account & automatic backup:</strong> Sign-in would restore history on a new phone without
          a manual sync link.
        </li>
        <li>
          <strong>Live partner sync:</strong> Two parents seeing updates instantly without sharing a link
          each time.
        </li>
        <li>
          <strong>Apple Watch:</strong> One-tap nap logging from your wrist.
        </li>
      </ul>
      <p className="prose" style={{ fontSize: '0.85rem', marginTop: '1rem' }}>
        Until then: use <strong>Family sync</strong> and <strong>JSON backup</strong> below to share and
        protect your data.
      </p>
    </Card>
  )
}
