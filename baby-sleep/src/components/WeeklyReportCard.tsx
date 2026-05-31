import { useState } from 'react'
import type { WeeklyReport } from '../types'
import { shareWeeklyReportImage } from '../lib/shareReportImage'
import { Card } from './ui/Card'

interface Props {
  report: WeeklyReport
  childName: string
}

export function WeeklyReportCard({ report, childName }: Props) {
  const [shareStatus, setShareStatus] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)

  const onShareImage = async () => {
    setSharing(true)
    setShareStatus(null)
    const result = await shareWeeklyReportImage(childName, report)
    setSharing(false)
    if (result === 'shared') setShareStatus('Shared — pick your family chat')
    else if (result === 'downloaded') setShareStatus('Image saved to your device')
    else setShareStatus('Could not create image — try again')
  }

  return (
    <Card title="Weekly summary" subtitle={report.periodLabel}>
      <div className="stat-grid">
        <div className="guide-chip">
          <strong style={{ display: 'block' }}>Avg sleep</strong>
          {report.avgTotalHours}h / day
        </div>
        <div className="guide-chip">
          <strong style={{ display: 'block' }}>Avg naps</strong>
          {report.avgNapCount} / day
        </div>
        {report.avgBedtime && (
          <div className="guide-chip">
            <strong style={{ display: 'block' }}>Typical bed</strong>
            {report.avgBedtime}
          </div>
        )}
      </div>
      <ul className="report-highlights">
        {report.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <div className="btn-row" style={{ marginTop: '1rem' }}>
        <button
          type="button"
          className="btn btn--primary"
          disabled={sharing}
          onClick={() => void onShareImage()}
        >
          {sharing ? 'Creating…' : 'Share as image'}
        </button>
      </div>
      {shareStatus && (
        <p className="prose" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
          {shareStatus}
        </p>
      )}
    </Card>
  )
}
