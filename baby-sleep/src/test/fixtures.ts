import type { AppState, ChildProfile, NightWake, SleepSession } from '../types'

export const CHILD_A: ChildProfile = {
  id: 'child-a',
  name: 'Luna',
  birthDate: '2024-06-15',
  color: '#4f46e5',
}

export const CHILD_B: ChildProfile = {
  id: 'child-b',
  name: 'Leo',
  birthDate: '2022-01-10',
  color: '#059669',
}

/** Alias used by App / hook integration tests */
export const TEST_CHILD_ID = CHILD_A.id

export function session(
  overrides: Partial<SleepSession> & Pick<SleepSession, 'id' | 'childId' | 'kind' | 'start'>,
): SleepSession {
  return {
    end: null,
    ...overrides,
  }
}

/** Fixed "now" for deterministic tests: 2025-06-15 14:00 local */
export const FIXED_NOW = new Date(2025, 5, 15, 14, 0, 0)

export function makeSampleSessions(childId: string): SleepSession[] {
  const day = '2025-06-15'
  return [
    session({
      id: 's1',
      childId,
      kind: 'night',
      start: `${day}T02:00:00.000Z`,
      end: `${day}T09:00:00.000Z`,
    }),
    session({
      id: 's2',
      childId,
      kind: 'nap',
      start: `${day}T11:00:00.000Z`,
      end: `${day}T12:30:00.000Z`,
    }),
    session({
      id: 's3',
      childId,
      kind: 'nap',
      start: `${day}T13:00:00.000Z`,
      end: null,
    }),
  ]
}

export function makeAppState(overrides?: Partial<AppState>): AppState {
  return {
    version: 2,
    children: [CHILD_A, CHILD_B],
    activeChildId: CHILD_A.id,
    sessions: makeSampleSessions(CHILD_A.id),
    householdCode: '',
    onboardingComplete: true,
    dayMarkers: [],
    syncMeta: { lastSyncedAt: null, lastSyncLabel: null, mergeCount: 0 },
    nightWakes: [],
    ...overrides,
  }
}

export function baseAppState(overrides: Partial<AppState> = {}): AppState {
  return makeAppState({
    sessions: [],
    nightWakes: [],
    children: [CHILD_A],
    activeChildId: CHILD_A.id,
    ...overrides,
  })
}

export function seedOnboardedState(overrides: Partial<AppState> = {}): void {
  localStorage.setItem('little-dream-app-v2', JSON.stringify(baseAppState(overrides)))
}

export function openNapSession(startIso: string, id = 'nap-open', childId = CHILD_A.id): SleepSession {
  return {
    id,
    childId,
    kind: 'nap',
    start: startIso,
    end: null,
  }
}

export function openNightSession(startIso: string, id = 'night-open', childId = CHILD_A.id): SleepSession {
  return {
    id,
    childId,
    kind: 'night',
    start: startIso,
    end: null,
  }
}

export function activeNightWake(
  nightSessionId: string,
  startIso: string,
  id = 'wake-active',
  childId = CHILD_A.id,
): NightWake {
  return {
    id,
    childId,
    nightSessionId,
    start: startIso,
    end: null,
  }
}
