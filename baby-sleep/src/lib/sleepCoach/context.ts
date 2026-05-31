import { format, parseISO } from 'date-fns'
import type { ChildProfile, DayMarker, SleepSession, WakeWindowGuidance } from '../../types'
import { formatHours, getDailySummaries } from '../analytics'
import { getSleepStatus } from '../sleepLogic'

export function buildCoachSystemPrompt(): string {
  return `You are Sleep Coach in the Little Dream baby sleep app. You give warm, practical, evidence-informed guidance for tired parents.

Rules:
- This is educational support, not medical advice. Say to contact their pediatrician for illness, breathing concerns, poor weight gain, or anything alarming.
- Use the baby's logged data when provided; don't invent sleep times.
- Be concise (short paragraphs, bullets when helpful). Mobile-friendly.
- You cannot change app data — only suggest what to log or try.
- Do not claim to be Composer or Cursor; you are Sleep Coach.`
}

export function buildCoachContextBlock(
  child: ChildProfile,
  sessions: SleepSession[],
  markers: DayMarker[],
  guidance: WakeWindowGuidance | null,
  now: Date,
): string {
  const lines: string[] = [
    `Child: ${child.name}`,
    child.birthDate ? `Birth date: ${child.birthDate}` : 'Birth date: not set',
  ]

  if (guidance) {
    lines.push(
      `Age guidance: ${guidance.ageLabel}; wake window ~${guidance.targetMinutes} min; daily sleep ${guidance.totalSleepHours.min}–${guidance.totalSleepHours.max}h; ${guidance.napCountHint}`,
    )
  }

  const status = getSleepStatus(sessions)
  if (status.isAsleep && status.asleepSince) {
    lines.push(`Current status: asleep since ${format(status.asleepSince, 'h:mm a')} (${status.currentSession?.kind ?? 'sleep'})`)
  } else if (status.awakeSince) {
    lines.push(`Current status: awake since ${format(status.awakeSince, 'h:mm a')}`)
  }

  const week = getDailySummaries(sessions, 7, now).filter((d) => d.totalMinutes > 0)
  if (week.length > 0) {
    lines.push('Last 7 days with logs:')
    for (const d of week.slice(-7)) {
      lines.push(
        `  ${d.date}: ${formatHours(d.totalMinutes)} total, ${d.napCount} naps`,
      )
    }
  }

  const recent = [...sessions]
    .filter((s) => s.end)
    .sort((a, b) => parseISO(b.end!).getTime() - parseISO(a.end!).getTime())
    .slice(0, 6)

  if (recent.length > 0) {
    lines.push('Recent sessions:')
    for (const s of recent) {
      const end = s.end ? format(parseISO(s.end), 'MMM d h:mm a') : '?'
      const start = format(parseISO(s.start), 'MMM d h:mm a')
      const feeding = s.feedingTags?.length ? ` feeding:${s.feedingTags.join(',')}` : ''
      lines.push(`  ${s.kind}: ${start} → ${end}${feeding}`)
    }
  }

  const today = format(now, 'yyyy-MM-dd')
  const todayMarkers = markers.filter((m) => m.childId === child.id && m.date === today)
  if (todayMarkers.length > 0) {
    lines.push('Today markers:')
    for (const m of todayMarkers) {
      lines.push(`  ${m.tag}${m.note ? ` — ${m.note}` : ''}`)
    }
  }

  return lines.join('\n')
}
