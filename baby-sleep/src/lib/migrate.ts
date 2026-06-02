import type {
  AppState,
  ChildProfile,
  DayMarker,
  NightWake,
  ReminderSettings,
  SleepSession,
  SyncMeta,
  WindDownChecklistState,
} from '../types'
import { normalizeChecklist } from './checklist'
import { DEFAULT_REMINDER_SETTINGS, generateId } from './sleepLogic'

export const CHILD_COLORS = [
  '#4f46e5',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#db2777',
  '#0891b2',
]

interface LegacyStateV1 {
  profile?: { name: string; birthDate: string }
  sessions?: Array<{
    id: string
    kind: 'nap' | 'night'
    start: string
    end: string | null
    childId?: string
  }>
  householdCode?: string
  version?: number
  v?: number
  children?: ChildProfile[]
  activeChildId?: string
  reminders?: ReminderSettings
  dayMarkers?: DayMarker[]
  syncMeta?: SyncMeta
  onboardingComplete?: boolean
  checklist?: WindDownChecklistState
  nightWakes?: NightWake[]
}

function isV2Payload(parsed: LegacyStateV1): boolean {
  return (
    (parsed.version === 2 || parsed.v === 2) &&
    Array.isArray(parsed.children)
  )
}

export function createDefaultChild(name = 'Baby', birthDate = ''): ChildProfile {
  return {
    id: generateId(),
    name,
    birthDate,
    color: CHILD_COLORS[0],
  }
}

export function normalizeState(raw: unknown): AppState {
  const parsed = raw as LegacyStateV1

  if (parsed && isV2Payload(parsed)) {
    let children = (parsed.children ?? []).map((c, i) => ({
      ...c,
      color: c.color || CHILD_COLORS[i % CHILD_COLORS.length],
    }))
    if (children.length === 0) {
      children = [createDefaultChild()]
    }
    const activeChildId =
      parsed.activeChildId && children.some((c) => c.id === parsed.activeChildId)
        ? parsed.activeChildId
        : children[0].id

    return normalizeAppFields({
      version: 2,
      children,
      activeChildId,
      sessions: (parsed.sessions ?? []).map((s) => ({
        ...s,
        childId: s.childId || activeChildId,
      })),
      householdCode: parsed.householdCode ?? '',
      reminders: normalizeReminders(parsed.reminders),
      dayMarkers: parsed.dayMarkers,
      syncMeta: parsed.syncMeta,
      onboardingComplete: parsed.onboardingComplete,
      checklist: parsed.checklist,
      nightWakes: parsed.nightWakes,
    })
  }

  const child = createDefaultChild(
    parsed?.profile?.name ?? 'Baby',
    parsed?.profile?.birthDate ?? '',
  )
  const sessions: SleepSession[] = (parsed?.sessions ?? []).map((s) => ({
    id: s.id,
    childId: s.childId ?? child.id,
    kind: s.kind,
    start: s.start,
    end: s.end,
  }))

  return normalizeAppFields({
    version: 2,
    children: [child],
    activeChildId: child.id,
    sessions,
    householdCode: parsed?.householdCode ?? '',
    reminders: normalizeReminders(parsed?.reminders),
    dayMarkers: parsed?.dayMarkers,
    syncMeta: parsed?.syncMeta,
    onboardingComplete: parsed?.onboardingComplete,
  })
}

function normalizeAppFields(state: AppState): AppState {
  return {
    ...state,
    dayMarkers: state.dayMarkers ?? [],
    nightWakes: state.nightWakes ?? [],
    syncMeta: state.syncMeta ?? { lastSyncedAt: null, lastSyncLabel: null, mergeCount: 0 },
    onboardingComplete: state.onboardingComplete ?? false,
    children: state.children,
    checklist: normalizeChecklist(state.checklist),
  }
}

function normalizeReminders(raw?: ReminderSettings): ReminderSettings {
  if (!raw) return { ...DEFAULT_REMINDER_SETTINGS }
  return {
    enabled: Boolean(raw.enabled),
    napMinutesBefore: raw.napMinutesBefore ?? DEFAULT_REMINDER_SETTINGS.napMinutesBefore,
    bedtimeMinutesBefore:
      raw.bedtimeMinutesBefore ?? DEFAULT_REMINDER_SETTINGS.bedtimeMinutesBefore,
  }
}

export function pickChildColor(index: number): string {
  return CHILD_COLORS[index % CHILD_COLORS.length]
}
