export type SleepKind = 'nap' | 'night'

export type FeedingTag = 'breast' | 'bottle' | 'solids'

export const FEEDING_TAG_LABELS: Record<FeedingTag, string> = {
  breast: 'Breast',
  bottle: 'Bottle',
  solids: 'Solids',
}

export type DayMarkerTag =
  | 'regression-4mo'
  | 'regression-8mo'
  | 'regression-12mo'
  | 'teething'
  | 'sick'
  | 'travel'
  | 'custom'

export const DAY_MARKER_LABELS: Record<DayMarkerTag, string> = {
  'regression-4mo': '4-month regression',
  'regression-8mo': '8–10 month regression',
  'regression-12mo': '12-month regression',
  teething: 'Teething',
  sick: 'Sick / unwell',
  travel: 'Travel / time zone',
  custom: 'Custom note',
}

export interface ChildRoutine {
  /** Override age-based target wake window (minutes). */
  customWakeTargetMinutes?: number
  /** Preferred bedtime as minutes from local midnight (e.g. 19:30 → 1170). */
  preferredBedtimeMinutes?: number
}

export interface ChildProfile {
  id: string
  name: string
  birthDate: string // YYYY-MM-DD
  color: string // hex accent for UI
  routine?: ChildRoutine
}

export interface SleepSession {
  id: string
  childId: string
  kind: SleepKind
  start: string // ISO
  end: string | null
  /** Optional context before/after sleep */
  feedingTags?: FeedingTag[]
}

/** Awake period during an ongoing night sleep (feed / resettle). */
export interface NightWake {
  id: string
  childId: string
  nightSessionId: string
  start: string // ISO
  end: string | null
  feedingTags?: FeedingTag[]
  note?: string
}

export interface DayMarker {
  id: string
  childId: string
  date: string // yyyy-MM-dd
  tag: DayMarkerTag
  note?: string
}

export interface SyncMeta {
  lastSyncedAt: string | null
  lastSyncLabel: string | null
  mergeCount: number
}

/** @deprecated Legacy single-child profile — migrated to ChildProfile */
export interface BabyProfile {
  name: string
  birthDate: string
}

export interface ChecklistItem {
  id: string
  kind: 'nap' | 'bed'
  label: string
}

export interface WindDownChecklistState {
  items: ChecklistItem[]
  /** yyyy-MM-dd when checkedIds was last reset */
  checkedDate: string
  checkedIds: string[]
}

export interface AppState {
  version: 2
  children: ChildProfile[]
  activeChildId: string
  sessions: SleepSession[]
  nightWakes?: NightWake[]
  householdCode: string
  reminders?: ReminderSettings
  dayMarkers?: DayMarker[]
  syncMeta?: SyncMeta
  onboardingComplete?: boolean
  checklist?: WindDownChecklistState
}

export interface UndoOffer {
  label: string
  expiresAt: number
  sessionsSnapshot: SleepSession[]
  nightWakesSnapshot: NightWake[]
}

export interface LoggingStreak {
  currentDays: number
  message: string
}

export interface ScienceSource {
  id?: string
  title: string
  url: string
  note?: string
}

export interface WakeWindowGuidance {
  minMinutes: number
  maxMinutes: number
  targetMinutes: number
  label: string
  ageLabel: string
  napCountHint: string
  totalSleepHours: { min: number; max: number }
  sleepyCues: string[]
  sources: ScienceSource[]
}

export interface NextNapPrediction {
  windowStart: Date
  windowEnd: Date
  sweetSpot: Date
  targetWakeMinutes: number
  explanation: string
  adjustmentNote?: string
  sources: ScienceSource[]
  adjustmentSources?: ScienceSource[]
}

export interface BedtimeGuidance {
  ageLabel: string
  typicalStartMinutes: number
  windowStartMinutes: number
  windowEndMinutes: number
  lastStretchWakeMinutes: number
  flexibleSchedule: boolean
}

export interface NextBedtimePrediction {
  windowStart: Date
  windowEnd: Date
  sweetSpot: Date
  explanation: string
  adjustmentNote?: string
  sources: ScienceSource[]
  adjustmentSources?: ScienceSource[]
  learnedFromHistory: boolean
  flexibleSchedule: boolean
}

export interface ReminderSettings {
  enabled: boolean
  napMinutesBefore: number
  bedtimeMinutesBefore: number
}

export interface PatternInsight {
  id: string
  type: 'positive' | 'neutral' | 'tip'
  title: string
  body: string
  sources: ScienceSource[]
}

export interface SleepStatus {
  isAsleep: boolean
  currentSession: SleepSession | null
  lastEndedSession: SleepSession | null
  awakeSince: Date | null
  asleepSince: Date | null
  /** Open night session (end null) even while up for a night wake */
  openNightSession: SleepSession | null
  activeNightWake: NightWake | null
}

export interface NightWakeStats {
  /** Wall-clock time since bedtime session started (does not reset on night wakes). */
  sinceBedtimeMinutes: number
  bedtimeStarted: string
  wakesTonight: number
  totalAwakeTonightMinutes: number
  currentWakeMinutes: number
  /** Time asleep tonight (since bedtime minus logged awake periods). */
  asleepTonightMinutes: number
  typicalResettleMinutes: number | null
  aimResettleBy: Date | null
}

export interface GlanceSummary {
  headline: string
  subline: string
  kind: 'asleep' | 'nap-soon' | 'bed-soon' | 'awake' | 'profile'
}

export interface SleepHint {
  id: string
  severity: 'info' | 'watch' | 'action'
  title: string
  body: string
}

export interface WeeklyReport {
  periodLabel: string
  avgTotalHours: number
  avgNapCount: number
  avgBedtime: string | null
  bedtimeDriftMinutes: number | null
  highlights: string[]
}
