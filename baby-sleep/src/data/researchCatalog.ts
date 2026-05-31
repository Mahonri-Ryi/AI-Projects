import type { ScienceSource } from '../types'

export type SourceId =
  | 'nsf'
  | 'cleveland'
  | 'pediatric-research'
  | 'sleep-medicine-review'
  | 'baby-sleep-science'

const CATALOG: Record<SourceId, ScienceSource> = {
  nsf: {
    id: 'nsf',
    title: 'National Sleep Foundation — Sleep duration by age',
    url: 'https://www.sleepfoundation.org/children-and-sleep/how-much-sleep-do-babies-and-kids-need',
    note: 'Recommended total sleep hours for newborns through school age',
  },
  cleveland: {
    id: 'cleveland',
    title: 'Cleveland Clinic — Wake windows by age',
    url: 'https://health.clevelandclinic.org/wake-windows-by-age',
    note: 'How long babies typically stay awake between sleeps at each stage',
  },
  'pediatric-research': {
    id: 'pediatric-research',
    title: 'Pediatric Research — Sleep & development in the first year',
    url: 'https://link.springer.com/article/10.1038/s41390-026-04780-4',
    note: 'How naps and night sleep consolidate from birth to 12 months',
  },
  'sleep-medicine-review': {
    id: 'sleep-medicine-review',
    title: 'Sleep Medicine Reviews — Evidence-based infant sleep',
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S1526054225001083',
    note: 'Polyphasic sleep and early wake-window norms',
  },
  'baby-sleep-science': {
    id: 'baby-sleep-science',
    title: 'Baby Sleep Science — Wake windows & sleep pressure',
    url: 'https://www.babysleepscience.com/single-post/the-science-behind-wake-windows-and-why-they-don-t-matter-as-much-as-you-think',
    note: 'Homeostatic sleep pressure, circadian rhythm, and flexible nap timing',
  },
}

export const ALL_SOURCE_IDS: SourceId[] = Object.keys(CATALOG) as SourceId[]

export function getSources(ids: SourceId[]): ScienceSource[] {
  return ids.map((id) => CATALOG[id]).filter(Boolean)
}

export function getAllSources(): ScienceSource[] {
  return ALL_SOURCE_IDS.map((id) => CATALOG[id])
}

/** Wake-window nap timing suggestions */
export const SOURCES_WAKE_WINDOWS: SourceId[] = [
  'cleveland',
  'baby-sleep-science',
  'sleep-medicine-review',
]

/** Daily total sleep targets & insights */
export const SOURCES_TOTAL_SLEEP: SourceId[] = ['nsf', 'pediatric-research']

/** Short nap / sleep-pressure adjustments */
export const SOURCES_SHORT_NAP: SourceId[] = ['baby-sleep-science', 'cleveland']

/** Sleepy cues & overtiredness */
export const SOURCES_SLEEPY_CUES: SourceId[] = ['cleveland', 'baby-sleep-science']

/** Circadian / variability */
export const SOURCES_CIRCADIAN: SourceId[] = ['pediatric-research', 'baby-sleep-science']

/** Frequent naps in young infants */
export const SOURCES_NAP_FREQUENCY: SourceId[] = ['pediatric-research', 'nsf']
