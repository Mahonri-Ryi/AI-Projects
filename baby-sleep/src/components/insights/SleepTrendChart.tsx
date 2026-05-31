import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DaySleepSummary } from '../../lib/analytics'

interface Props {
  data: DaySleepSummary[]
  targetMinHours: number
  targetMaxHours: number
}

export function SleepTrendChart({ data, targetMinHours, targetMaxHours }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    totalHours: Math.round((d.totalMinutes / 60) * 10) / 10,
    napHours: Math.round((d.napMinutes / 60) * 10) / 10,
    nightHours: Math.round((d.nightMinutes / 60) * 10) / 10,
  }))

  const targetMid = (targetMinHours + targetMaxHours) / 2

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 'auto']}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 13,
              color: 'var(--text)',
            }}
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                totalHours: 'Total sleep',
                napHours: 'Naps',
                nightHours: 'Night',
              }
              const n = typeof name === 'string' ? name : String(name)
              const v = typeof value === 'number' ? value : Number(value ?? 0)
              return [`${v}h`, labels[n] ?? n]
            }}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as DaySleepSummary | undefined
              return row ? row.date : ''
            }}
          />
          <ReferenceLine
            y={targetMinHours}
            stroke="var(--chart-target)"
            strokeDasharray="4 4"
            label={{ value: 'Min', position: 'insideTopRight', fontSize: 10, fill: 'var(--text-muted)' }}
          />
          <ReferenceLine
            y={targetMaxHours}
            stroke="var(--chart-target)"
            strokeDasharray="4 4"
          />
          <ReferenceLine
            y={targetMid}
            stroke="var(--border-strong)"
            strokeDasharray="2 6"
          />
          <Area
            type="monotone"
            dataKey="totalHours"
            stroke="var(--chart-primary)"
            strokeWidth={2.5}
            fill="url(#sleepGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <span>
          <i className="legend-dot legend-dot--primary" /> Total sleep
        </span>
        <span>
          <i className="legend-dot legend-dot--target" /> Age guideline ({targetMinHours}–{targetMaxHours}h)
        </span>
      </div>
    </div>
  )
}

export function NapNightStackChart({ data }: { data: DaySleepSummary[] }) {
  const chartData = data.map((d) => ({
    label: d.label,
    naps: Math.round((d.napMinutes / 60) * 10) / 10,
    night: Math.round((d.nightMinutes / 60) * 10) / 10,
  }))

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 13,
              color: 'var(--text)',
            }}
          />
          <Area
            type="monotone"
            dataKey="night"
            stackId="1"
            stroke="var(--chart-night)"
            fill="var(--chart-night)"
            fillOpacity={0.7}
          />
          <Area
            type="monotone"
            dataKey="naps"
            stackId="1"
            stroke="var(--chart-nap)"
            fill="var(--chart-nap)"
            fillOpacity={0.85}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <span>
          <i className="legend-dot legend-dot--nap" /> Daytime naps
        </span>
        <span>
          <i className="legend-dot legend-dot--night" /> Night sleep
        </span>
      </div>
    </div>
  )
}
