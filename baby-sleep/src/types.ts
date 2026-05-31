export type SleepKind = 'nap' | 'night'

export interface ChildProfile {
  id: string
  name: string
  birthDate: string // YYYY-MM-DD
  color: string // hex accent for UI
}

export interface SleepSession {
  id: string
  childId: string
  kind: SleepKind
  start: string // ISO
  end: string | null
}

/** @deprecated Legacy single-child profile — migrated to ChildProfile */
export interface BabyProfile {
  name: string
  birthDate: string
}

export interface AppState {
  version: 2
  children: ChildProfile[]
  activeChildId: string
  sessions: SleepSession[]
  householdCode: string
  reminders?: ReminderSettings
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
  typicalStartMinutes: number // minutes from local midnight
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
}
