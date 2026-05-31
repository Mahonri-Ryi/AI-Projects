export type SleepKind = 'nap' | 'night'

export interface SleepSession {
  id: string
  kind: SleepKind
  start: string // ISO
  end: string | null
}

export interface BabyProfile {
  name: string
  birthDate: string // YYYY-MM-DD
}

export interface AppState {
  profile: BabyProfile
  sessions: SleepSession[]
  householdCode: string
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

export interface ScienceSource {
  title: string
  url: string
  note?: string
}

export interface NextNapPrediction {
  windowStart: Date
  windowEnd: Date
  sweetSpot: Date
  targetWakeMinutes: number
  explanation: string
  adjustmentNote?: string
}

export interface SleepStatus {
  isAsleep: boolean
  currentSession: SleepSession | null
  lastEndedSession: SleepSession | null
  awakeSince: Date | null
  asleepSince: Date | null
}
