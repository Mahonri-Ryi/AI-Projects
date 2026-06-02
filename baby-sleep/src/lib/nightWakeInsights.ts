import { differenceInMinutes, parseISO, subDays } from 'date-fns'
import type { NightWake, PatternInsight } from '../types'
import { formatDurationWords } from './timeDisplay'

export function generateNightWakeInsights(
  nightWakes: NightWake[],
  childId: string,
  now = new Date(),
): PatternInsight[] {
  const cutoff = subDays(now, 14)
  const completed = nightWakes.filter(
    (w) =>
      w.childId === childId &&
      w.end &&
      parseISO(w.end).getTime() >= cutoff.getTime(),
  )
  if (completed.length === 0) return []

  const insights: PatternInsight[] = []
  const durations = completed.map((w) =>
    differenceInMinutes(parseISO(w.end!), parseISO(w.start)),
  )
  const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
  const longest = Math.max(...durations)
  const nightsWithWakes = new Set(
    completed.map((w) => parseISO(w.start).toDateString()),
  ).size

  insights.push({
    id: 'night-wake-avg',
    type: 'neutral',
    title: 'Night wake patterns',
    body: `Last 14 days: ${completed.length} logged wakes across ${nightsWithWakes} night(s). Average awake per wake ~${formatDurationWords(avg)}.`,
    sources: [],
  })

  if (longest >= 45) {
    insights.push({
      id: 'night-wake-long',
      type: 'tip',
      title: 'Longest recent wake',
      body: `Longest single wake was ${formatDurationWords(longest)}. Logging feeds (tags on Back to sleep) can help spot patterns over time.`,
      sources: [],
    })
  }

  return insights.slice(0, 2)
}
