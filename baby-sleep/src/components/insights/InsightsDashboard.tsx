import { useMemo, useState } from 'react'
import type { WakeWindowGuidance } from '../../types'
import type { SleepSession } from '../../types'
import {
  formatHours,
  generateInsights,
  getDailySummaries,
  getDayTimeline,
  getPeriodStats,
  getTodayStats,
} from '../../lib/analytics'
import { getSources, SOURCES_TOTAL_SLEEP } from '../../data/researchCatalog'
import { Card, StatCard } from '../ui/Card'
import { ResearchLinks } from '../ui/ResearchLinks'
import { IconTrendUp } from '../icons'
import { NapNightStackChart, SleepTrendChart } from './SleepTrendChart'
import { DayTimeline, TodayTimelineHeader } from './DayTimeline'

type Range = 7 | 14 | 30

interface Props {
  sessions: SleepSession[]
  guidance: WakeWindowGuidance | null
  now: Date
}

export function InsightsDashboard({ sessions, guidance, now }: Props) {
  const [range, setRange] = useState<Range>(14)

  const targetMin = guidance?.totalSleepHours.min ?? 12
  const targetMax = guidance?.totalSleepHours.max ?? 15

  const summaries = useMemo(
    () => getDailySummaries(sessions, range, now),
    [sessions, range, now],
  )

  const periodStats = useMemo(() => getPeriodStats(summaries), [summaries])

  const today = useMemo(
    () => getTodayStats(sessions, targetMin, targetMax, now),
    [sessions, targetMin, targetMax, now],
  )

  const insights = useMemo(
    () => generateInsights(summaries, targetMin, targetMax),
    [summaries, targetMin, targetMax],
  )

  const todayTimeline = useMemo(
    () => getDayTimeline(sessions, now, now),
    [sessions, now],
  )

  const todayHours = today.totalMinutes / 60
  const progress = Math.min(100, (today.totalMinutes / today.targetMax) * 100)

  return (
    <div className="insights-page">
      <div className="range-toggle" role="group" aria-label="Date range">
        {([7, 14, 30] as Range[]).map((d) => (
          <button
            key={d}
            type="button"
            className={range === d ? 'range-toggle__btn--active' : ''}
            onClick={() => setRange(d)}
          >
            {d} days
          </button>
        ))}
      </div>

      <div className="stat-grid">
        <StatCard
          label="Avg sleep"
          value={periodStats.daysWithData > 0 ? `${periodStats.avgTotalHours}h` : '—'}
          hint={`${periodStats.daysWithData} days logged`}
          accent="primary"
          trend={
            periodStats.trendPercent !== null
              ? `${periodStats.trendPercent > 0 ? '+' : ''}${periodStats.trendPercent}%`
              : undefined
          }
          trendUp={periodStats.trendPercent !== null ? periodStats.trendPercent > 0 : undefined}
        />
        <StatCard
          label="Avg naps"
          value={periodStats.daysWithData > 0 ? String(periodStats.avgNapCount) : '—'}
          hint="per day"
          accent="default"
        />
        <StatCard
          label="Today"
          value={formatHours(today.totalMinutes)}
          hint={`${today.napCount} naps · target ${targetMin}–${targetMax}h`}
          accent="success"
        />
        <StatCard
          label="Avg nap length"
          value={
            periodStats.avgNapMinutes > 0 ? formatHours(periodStats.avgNapMinutes) : '—'
          }
          hint="when naps logged"
          accent="default"
        />
      </div>

      <Card title="Today's progress" subtitle="Total sleep vs. age-based daily target">
        <div className="progress-ring-wrap">
          <div
            className="progress-ring"
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          >
            <div className="progress-ring__inner">
              <span className="progress-ring__value">{Math.round(todayHours * 10) / 10}h</span>
              <span className="progress-ring__label">today</span>
            </div>
          </div>
          <ul className="progress-breakdown">
            <li>
              <span className="dot dot--nap" /> Naps {formatHours(today.napMinutes)}
            </li>
            <li>
              <span className="dot dot--night" /> Night {formatHours(today.nightMinutes)}
            </li>
            <li>
              <span className="dot dot--muted" /> Goal {targetMin}–{targetMax}h
            </li>
          </ul>
        </div>
        <ResearchLinks sources={getSources(SOURCES_TOTAL_SLEEP)} title="Daily sleep guidelines" compact />
      </Card>

      <Card title="Today's schedule" subtitle={<TodayTimelineHeader now={now} />}>
        <DayTimeline blocks={todayTimeline} dateLabel="Today" />
      </Card>

      <Card title="Sleep trends" subtitle={`Total daily sleep · last ${range} days`}>
        {periodStats.daysWithData < 1 ? (
          <EmptyChart message="Log sleep sessions to see trends over time." />
        ) : (
          <SleepTrendChart
            data={summaries}
            targetMinHours={targetMin}
            targetMaxHours={targetMax}
            compactXAxis={range >= 30}
          />
        )}
      </Card>

      <Card title="Nap vs. night" subtitle="How sleep is distributed each day">
        {periodStats.daysWithData < 1 ? (
          <EmptyChart message="Your nap and night breakdown will appear here." />
        ) : (
          <NapNightStackChart data={summaries} compactXAxis={range >= 30} />
        )}
      </Card>

      <Card title="Pattern insights" subtitle="Based on your logged data">
        <ul className="insight-list">
          {insights.map((item) => (
            <li key={item.id} className={`insight-item insight-item--${item.type}`}>
              <div className="insight-item__icon">
                {item.type === 'positive' ? <IconTrendUp /> : null}
              </div>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <ResearchLinks sources={item.sources} compact />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="chart-empty">
      <div className="chart-empty__bars" aria-hidden>
        {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
          <span key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
      <p>{message}</p>
    </div>
  )
}
