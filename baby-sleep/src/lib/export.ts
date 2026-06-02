import { differenceInMinutes, format, parseISO } from 'date-fns'
import type { AppState, ChildProfile, NightWake, SleepSession } from '../types'
import { formatDurationWords } from './timeDisplay'
import { getDailySummaries, getPeriodStats, formatHours } from './analytics'

function sessionMinutes(s: SleepSession): number {
  if (!s.end) return 0
  return Math.round((parseISO(s.end).getTime() - parseISO(s.start).getTime()) / 60_000)
}

export function stateToJsonBlob(state: AppState): Blob {
  return new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export function exportJson(state: AppState): void {
  const date = new Date().toISOString().slice(0, 10)
  downloadBlob(stateToJsonBlob(state), `little-dream-backup-${date}.json`)
}

export function sessionsToCsv(state: AppState): string {
  const childName = new Map(state.children.map((c) => [c.id, c.name]))
  const headers = ['child', 'kind', 'start', 'end', 'duration_minutes', 'notes']
  const sessionRows = [...state.sessions]
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
    .map((s) => [
      childName.get(s.childId) ?? s.childId,
      s.kind,
      s.start,
      s.end ?? '',
      String(sessionMinutes(s)),
      '',
    ])
  const wakeRows = [...(state.nightWakes ?? [])]
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
    .map((w) => [
      childName.get(w.childId) ?? w.childId,
      'night_wake',
      w.start,
      w.end ?? '',
      String(nightWakeMinutes(w)),
      w.note ?? '',
    ])
  const rows = [...sessionRows, ...wakeRows].sort(
    (a, b) => parseISO(a[2] as string).getTime() - parseISO(b[2] as string).getTime(),
  )
  return [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n')
}

function nightWakeMinutes(w: NightWake): number {
  if (!w.end) return 0
  return Math.round((parseISO(w.end).getTime() - parseISO(w.start).getTime()) / 60_000)
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportCsv(state: AppState): void {
  const csv = sessionsToCsv(state)
  const date = new Date().toISOString().slice(0, 10)
  downloadBlob(new Blob([csv], { type: 'text/csv' }), `little-dream-sessions-${date}.csv`)
}

export function buildPediatricianReport(
  child: ChildProfile,
  sessions: SleepSession[],
  days = 14,
  nightWakes: NightWake[] = [],
): string {
  const summaries = getDailySummaries(sessions, days)
  const stats = getPeriodStats(summaries)
  const childWakeList = nightWakes.filter((w) => w.childId === child.id && w.end)
  const lines: string[] = [
    'Little Dream — Sleep summary for caregiver visit',
    `Child: ${child.name}`,
    `Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`,
    `Period: last ${days} days`,
    '',
    `Average total sleep: ${stats.avgTotalHours}h/day (${stats.daysWithData} days logged)`,
    `Average naps per day: ${stats.avgNapCount}`,
    `Average nap length: ${Math.round(stats.avgNapMinutes)} min`,
  ]

  if (childWakeList.length > 0) {
    const avgWake = Math.round(
      childWakeList.reduce(
        (s, w) => s + differenceInMinutes(parseISO(w.end!), parseISO(w.start)),
        0,
      ) / childWakeList.length,
    )
    lines.push(
      `Night wakes logged: ${childWakeList.length} (avg awake per wake ~${formatDurationWords(avgWake)})`,
    )
  }

  lines.push('', 'Daily log:')

  for (const d of summaries.filter((x) => x.totalMinutes > 0)) {
    lines.push(
      `  ${d.label} ${d.date}: ${formatHours(d.totalMinutes)} total (${d.napCount} naps, night ${formatHours(d.nightMinutes)})`,
    )
  }

  lines.push(
    '',
    'Note: Consumer app log — not a medical device. Discuss concerns with your pediatrician.',
  )
  return lines.join('\n')
}

export function exportPediatricianText(
  child: ChildProfile,
  sessions: SleepSession[],
  nightWakes: NightWake[] = [],
): void {
  const text = buildPediatricianReport(child, sessions, 14, nightWakes)
  const date = new Date().toISOString().slice(0, 10)
  downloadBlob(new Blob([text], { type: 'text/plain' }), `little-dream-visit-${child.name}-${date}.txt`)
}

export function printPediatricianReport(
  child: ChildProfile,
  sessions: SleepSession[],
  nightWakes: NightWake[] = [],
): void {
  const text = buildPediatricianReport(child, sessions, 14, nightWakes)
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sleep summary — ${child.name}</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:2rem auto;line-height:1.5;color:#111}
h1{font-size:1.25rem}pre{white-space:pre-wrap;font-size:0.9rem}</style></head>
<body><h1>Sleep summary — ${child.name}</h1><pre>${text.replace(/</g, '&lt;')}</pre>
<script>window.onload=function(){window.print()}</script></body></html>`
  const w = window.open('', '_blank')
  if (!w) {
    exportPediatricianText(child, sessions, nightWakes)
    return
  }
  w.document.write(html)
  w.document.close()
}
