import LZString from 'lz-string'
import { describe, expect, it } from 'vitest'
import { CHILD_A, CHILD_B, makeAppState, session } from '../test/fixtures'
import {
  decodeSyncFromUrl,
  encodeSyncLink,
  mergeAppState,
  mergeSessions,
} from './sync'

describe('encodeSyncLink / decodeSyncFromUrl', () => {
  it('round-trips v2 state through URL', () => {
    const state = makeAppState()
    const url = encodeSyncLink(state, 'https://example.com/app/')
    const query = new URL(url).search
    const decoded = decodeSyncFromUrl(query)
    expect(decoded).not.toBeNull()
    expect(decoded!.children).toHaveLength(2)
    expect(decoded!.sessions.length).toBe(state.sessions.length)
    expect(decoded!.activeChildId).toBe(state.activeChildId)
  })

  it('decodes legacy v1 sync payload', () => {
    const v1 = {
      v: 1 as const,
      profile: { name: 'Legacy', birthDate: '2023-01-01' },
      sessions: [
        {
          id: 's1',
          kind: 'nap' as const,
          start: '2025-01-01T10:00:00.000Z',
          end: '2025-01-01T11:00:00.000Z',
        },
      ],
    }
    const payload = LZString.compressToEncodedURIComponent(JSON.stringify(v1))
    const decoded = decodeSyncFromUrl(`?sync=${payload}`)
    expect(decoded?.children[0].name).toBe('Legacy')
    expect(decoded?.sessions).toHaveLength(1)
  })

  it('returns null for invalid sync data', () => {
    expect(decodeSyncFromUrl('?sync=not-valid')).toBeNull()
    expect(decodeSyncFromUrl('')).toBeNull()
  })
})

describe('mergeSessions', () => {
  it('merges by id and prefers completed session', () => {
    const local = [
      session({
        id: 's1',
        childId: CHILD_A.id,
        kind: 'nap',
        start: '2025-01-01T10:00:00.000Z',
        end: null,
      }),
    ]
    const incoming = [
      session({
        id: 's1',
        childId: CHILD_A.id,
        kind: 'nap',
        start: '2025-01-01T10:00:00.000Z',
        end: '2025-01-01T11:00:00.000Z',
      }),
    ]
    const merged = mergeSessions(local, incoming)
    expect(merged).toHaveLength(1)
    expect(merged[0].end).not.toBeNull()
  })

  it('adds new sessions from incoming', () => {
    const local: ReturnType<typeof session>[] = []
    const incoming = [
      session({
        id: 'new',
        childId: CHILD_B.id,
        kind: 'night',
        start: '2025-01-01T20:00:00.000Z',
        end: '2025-01-02T06:00:00.000Z',
      }),
    ]
    const merged = mergeSessions(local, incoming)
    expect(merged).toHaveLength(1)
    expect(merged[0].id).toBe('new')
  })
})

describe('mergeAppState', () => {
  it('merges children from both households', () => {
    const local = makeAppState({ children: [CHILD_A], activeChildId: CHILD_A.id })
    const incoming = makeAppState({
      children: [CHILD_B],
      activeChildId: CHILD_B.id,
      sessions: [],
    })
    const merged = mergeAppState(local, incoming)
    expect(merged.children).toHaveLength(2)
    expect(merged.activeChildId).toBe(CHILD_A.id)
  })
})
