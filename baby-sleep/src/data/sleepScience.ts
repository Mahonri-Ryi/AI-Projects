import type { WakeWindowGuidance } from '../types'

/**
 * Age-based sleep guidance synthesized from pediatric sleep research.
 * Wake windows = time awake between sleep periods (homeostatic sleep pressure).
 * Ranges are guides — individual babies vary; watch sleepy cues.
 */
export interface AgeBand {
  minMonths: number
  maxMonths: number
  wakeMin: number
  wakeMax: number
  totalSleepMin: number
  totalSleepMax: number
  napHint: string
  ageLabel: string
}

export const AGE_BANDS: AgeBand[] = [
  {
    minMonths: 0,
    maxMonths: 1,
    wakeMin: 30,
    wakeMax: 60,
    totalSleepMin: 14,
    totalSleepMax: 17,
    napHint: 'Many short naps; sleep is polyphasic day and night',
    ageLabel: '0–1 month (newborn)',
  },
  {
    minMonths: 1,
    maxMonths: 3,
    wakeMin: 60,
    wakeMax: 120,
    totalSleepMin: 14,
    totalSleepMax: 17,
    napHint: '3–5 naps per day is common',
    ageLabel: '1–3 months',
  },
  {
    minMonths: 3,
    maxMonths: 4,
    wakeMin: 75,
    wakeMax: 150,
    totalSleepMin: 14,
    totalSleepMax: 16,
    napHint: '3–4 naps; circadian rhythm developing (~3–4 mo)',
    ageLabel: '3–4 months',
  },
  {
    minMonths: 4,
    maxMonths: 6,
    wakeMin: 90,
    wakeMax: 150,
    totalSleepMin: 14,
    totalSleepMax: 15,
    napHint: '3 naps typical; ~14.5–15 h total sleep/24 h',
    ageLabel: '4–6 months',
  },
  {
    minMonths: 6,
    maxMonths: 8,
    wakeMin: 120,
    wakeMax: 210,
    totalSleepMin: 13,
    totalSleepMax: 15,
    napHint: '2–3 naps; night sleep consolidating',
    ageLabel: '6–8 months',
  },
  {
    minMonths: 8,
    maxMonths: 10,
    wakeMin: 150,
    wakeMax: 240,
    totalSleepMin: 12,
    totalSleepMax: 15,
    napHint: '2 naps common; watch 8–10 mo regression',
    ageLabel: '8–10 months',
  },
  {
    minMonths: 10,
    maxMonths: 12,
    wakeMin: 180,
    wakeMax: 300,
    totalSleepMin: 12,
    totalSleepMax: 14,
    napHint: 'Often 2 naps → transition to 1 nap later',
    ageLabel: '10–12 months',
  },
  {
    minMonths: 12,
    maxMonths: 18,
    wakeMin: 180,
    wakeMax: 300,
    totalSleepMin: 11,
    totalSleepMax: 14,
    napHint: '1–2 naps; ~1.2 naps/day average at 12 mo (population data)',
    ageLabel: '12–18 months',
  },
  {
    minMonths: 18,
    maxMonths: 36,
    wakeMin: 240,
    wakeMax: 360,
    totalSleepMin: 11,
    totalSleepMax: 14,
    napHint: '1 nap (or dropping nap); bedtime stays fairly consistent',
    ageLabel: '18–36 months',
  },
]

export const SLEEPY_CUES = [
  'Yawning',
  'Rubbing eyes or ears',
  'Staring off / glazed look',
  'Decreased activity or fussiness',
  'Turning head away from stimulation',
]

export const RESEARCH_SOURCES = [
  {
    title: 'National Sleep Foundation — Sleep Duration Recommendations',
    url: 'https://www.sleepfoundation.org/children-and-sleep/how-much-sleep-do-babies-and-kids-need',
    note: 'Newborns 14–17 h; infants 12–15 h; toddlers 11–14 h per 24 h',
  },
  {
    title: 'Cleveland Clinic — Wake Windows by Age',
    url: 'https://health.clevelandclinic.org/wake-windows-by-age',
    note: 'Developmental wake-window ranges in the first year',
  },
  {
    title: 'Pediatric Research — Sleep and infant development in the first year',
    url: 'https://link.springer.com/article/10.1038/s41390-026-04780-4',
    note: 'Sleep consolidation, nap frequency, and TST changes 0–12 mo',
  },
  {
    title: 'Sleep Medicine Reviews — Optimizing infant sleep (evidence-based review)',
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S1526054225001083',
    note: 'Polyphasic sleep, wake windows 30–90 min in early months',
  },
  {
    title: 'Baby Sleep Science — Wake windows, sleep pressure & circadian rhythm',
    url: 'https://www.babysleepscience.com/single-post/the-science-behind-wake-windows-and-why-they-don-t-matter-as-much-as-you-think',
    note: 'Use wake windows flexibly for naps; keep bedtime consistent after ~3 mo',
  },
]

export function getAgeInMonths(birthDate: string, asOf = new Date()): number {
  const birth = new Date(birthDate + 'T12:00:00')
  const years = asOf.getFullYear() - birth.getFullYear()
  const months = asOf.getMonth() - birth.getMonth()
  const days = asOf.getDate() - birth.getDate()
  let total = years * 12 + months
  if (days < 0) total -= 1
  return Math.max(0, total)
}

export function formatAge(months: number): string {
  if (months < 1) return 'under 1 month'
  if (months < 24) {
    const m = months % 12
    const y = Math.floor(months / 12)
    if (y === 0) return `${months} month${months === 1 ? '' : 's'}`
    if (m === 0) return `${y} year${y === 1 ? '' : 's'}`
    return `${y}y ${m}m`
  }
  const y = Math.floor(months / 12)
  const m = months % 12
  return m > 0 ? `${y}y ${m}m` : `${y} years`
}

function getBand(months: number): AgeBand {
  const band =
    AGE_BANDS.find((b) => months >= b.minMonths && months < b.maxMonths) ??
    AGE_BANDS[AGE_BANDS.length - 1]
  return band
}

export function getWakeWindowGuidance(
  birthDate: string,
  asOf = new Date(),
): WakeWindowGuidance {
  const months = getAgeInMonths(birthDate, asOf)
  const band = getBand(months)
  const targetMinutes = Math.round((band.wakeMin + band.wakeMax) / 2)

  return {
    minMinutes: band.wakeMin,
    maxMinutes: band.wakeMax,
    targetMinutes,
    label: `${band.wakeMin}–${band.wakeMax} min`,
    ageLabel: band.ageLabel,
    napCountHint: band.napHint,
    totalSleepHours: { min: band.totalSleepMin, max: band.totalSleepMax },
    sleepyCues: SLEEPY_CUES,
    sources: RESEARCH_SOURCES,
  }
}

/** Typical nap length by age (minutes) — for “still napping” context */
export function typicalNapDurationMinutes(ageMonths: number): number {
  if (ageMonths < 3) return 45
  if (ageMonths < 6) return 60
  if (ageMonths < 9) return 75
  if (ageMonths < 12) return 90
  return 90
}
