import LZString from 'lz-string'
import type { AppState } from '../types'

export interface SyncPayload {
  v: 1
  profile: AppState['profile']
  sessions: AppState['sessions']
}

export function encodeSyncLink(state: AppState, baseUrl: string): string {
  const payload: SyncPayload = {
    v: 1,
    profile: state.profile,
    sessions: state.sessions.slice(-200),
  }
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload))
  const url = new URL(baseUrl)
  url.searchParams.set('sync', compressed)
  return url.toString()
}

export function decodeSyncFromUrl(search: string): SyncPayload | null {
  const params = new URLSearchParams(search)
  const data = params.get('sync')
  if (!data) return null
  try {
    const json = LZString.decompressFromEncodedURIComponent(data)
    if (!json) return null
    const payload = JSON.parse(json) as SyncPayload
    if (payload.v !== 1) return null
    return payload
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
    if (s.end && !existing.end) byId.set(s.id, s)
  }
  return [...byId.values()].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )
}
