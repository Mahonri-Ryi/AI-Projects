import type { AppState, ChildProfile, SleepSession } from '../types'

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
    ...overrides,
  }
}
