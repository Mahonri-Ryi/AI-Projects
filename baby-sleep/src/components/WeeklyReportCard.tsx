import type { WeeklyReport } from '../types'
import { Card } from './ui/Card'

interface Props {
  report: WeeklyReport
}

export function WeeklyReportCard({ report }: Props) {
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
    </Card>
  )
}
