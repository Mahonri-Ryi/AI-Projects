import LZString from 'lz-string'
import type { AppState, NightWake } from '../types'
import { normalizeState } from './migrate'

export interface SyncPayloadV3 {
  v: 3
  children: AppState['children']
  activeChildId: string
  sessions: AppState['sessions']
  dayMarkers?: AppState['dayMarkers']
  nightWakes?: AppState['nightWakes']
}

export interface SyncPayloadV4 {
  v: 4
  children: AppState['children']
  activeChildId: string
  sessions: AppState['sessions']
  dayMarkers?: AppState['dayMarkers']
  nightWakes?: AppState['nightWakes']
}

export interface SyncPayloadV2 {
  v: 2
  children: AppState['children']
  activeChildId: string
  sessions: AppState['sessions']
}

export interface SyncPayloadV1 {
  v: 1
  profile: { name: string; birthDate: string }
  sessions: Array<{
    id: string
    kind: 'nap' | 'night'
    start: string
    end: string | null
  }>
}

export function encodeSyncLink(state: AppState, baseUrl: string): string {
  const payload: SyncPayloadV4 = {
    v: 4,
    children: state.children,
    activeChildId: state.activeChildId,
    sessions: state.sessions.slice(-400),
    dayMarkers: state.dayMarkers?.slice(-200),
    nightWakes: state.nightWakes?.slice(-300),
  }
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload))
  const url = new URL(baseUrl)
  url.searchParams.set('sync', compressed)
  return url.toString()
}

export function decodeSyncFromUrl(search: string): AppState | null {
  const params = new URLSearchParams(search)
  const data = params.get('sync')
  if (!data) return null
  try {
    const json = LZString.decompressFromEncodedURIComponent(data)
    if (!json) return null
    const parsed = JSON.parse(json) as SyncPayloadV4 | SyncPayloadV3 | SyncPayloadV2 | SyncPayloadV1

    if (parsed.v === 4 || parsed.v === 3) {
      return normalizeState({ version: 2, ...parsed })
    }

    if (parsed.v === 2) {
      return normalizeState(parsed)
    }

    if (parsed.v === 1) {
      return normalizeState({
        profile: parsed.profile,
        sessions: parsed.sessions,
      })
    }

    return null
  } catch {
    return null
  }
}

export function mergeSessions(
  local: AppState['sessions'],
  incoming: AppState['sessions'],
): AppState['sessions'] {
  const byId = new Map<string, AppState['sessions'][0]>()
  for (const s of local) byId.set(s.id, s)
  for (const s of incoming) {
    const existing = byId.get(s.id)
    if (!existing) {
      byId.set(s.id, s)
      continue
    }
    if (s.end && !existing.end) {
      byId.set(s.id, s)
      continue
    }
    if (s.end && existing.end) {
      const sEnd = new Date(s.end).getTime()
      const eEnd = new Date(existing.end).getTime()
      if (sEnd > eEnd) byId.set(s.id, s)
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )
}

function mergeDayMarkers(
  local: AppState['dayMarkers'],
  incoming: AppState['dayMarkers'],
): AppState['dayMarkers'] {
  const byKey = new Map<string, NonNullable<AppState['dayMarkers']>[0]>()
  for (const m of local ?? []) byKey.set(`${m.childId}:${m.date}`, m)
  for (const m of incoming ?? []) byKey.set(`${m.childId}:${m.date}`, m)
  return [...byKey.values()]
}

export function mergeNightWakes(
  local: NightWake[] | undefined,
  incoming: NightWake[] | undefined,
): NightWake[] {
  const byId = new Map<string, NightWake>()
  for (const w of local ?? []) byId.set(w.id, w)
  for (const w of incoming ?? []) {
    const existing = byId.get(w.id)
    if (!existing) {
      byId.set(w.id, w)
      continue
    }
    if (w.end && !existing.end) {
      byId.set(w.id, w)
      continue
    }
    if (w.end && existing.end) {
      const wEnd = new Date(w.end).getTime()
      const eEnd = new Date(existing.end).getTime()
      if (wEnd > eEnd) byId.set(w.id, w)
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )
}

export function mergeAppState(local: AppState, incoming: AppState): AppState {
  const childById = new Map(local.children.map((c) => [c.id, c]))
  for (const c of incoming.children) {
    if (!childById.has(c.id)) childById.set(c.id, c)
    else {
      const existing = childById.get(c.id)!
      childById.set(c.id, {
        ...existing,
        name: c.name || existing.name,
        birthDate: c.birthDate || existing.birthDate,
        routine: { ...existing.routine, ...c.routine },
      })
    }
  }

  const sessions = mergeSessions(local.sessions, incoming.sessions)
  const mergeCount = (local.syncMeta?.mergeCount ?? 0) + 1

  return normalizeState({
    ...local,
    children: [...childById.values()],
    activeChildId: local.activeChildId || incoming.activeChildId,
    sessions,
    dayMarkers: mergeDayMarkers(local.dayMarkers, incoming.dayMarkers),
    nightWakes: mergeNightWakes(local.nightWakes, incoming.nightWakes),
    syncMeta: {
      lastSyncedAt: new Date().toISOString(),
      lastSyncLabel: `Merged ${incoming.sessions.length} sessions from partner`,
      mergeCount,
    },
  })
}
