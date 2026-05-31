import LZString from 'lz-string'
import type { AppState } from '../types'
import { normalizeState } from './migrate'

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
  const payload: SyncPayloadV2 = {
    v: 2,
    children: state.children,
    activeChildId: state.activeChildId,
    sessions: state.sessions.slice(-400),
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
    const parsed = JSON.parse(json) as SyncPayloadV2 | SyncPayloadV1

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
      })
    }
  }

  const sessions = mergeSessions(local.sessions, incoming.sessions)

  return {
    version: 2,
    children: [...childById.values()],
    activeChildId: local.activeChildId || incoming.activeChildId,
    sessions,
    householdCode: local.householdCode || incoming.householdCode,
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
    if (s.end && !existing.end) byId.set(s.id, s)
  }
  return [...byId.values()].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )
}
