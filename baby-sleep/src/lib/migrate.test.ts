import { describe, expect, it } from 'vitest'
import { CHILD_A, CHILD_B } from '../test/fixtures'
import {
  CHILD_COLORS,
  createDefaultChild,
  normalizeState,
  pickChildColor,
} from './migrate'

describe('normalizeState', () => {
  it('migrates legacy v1 profile and sessions', () => {
    const state = normalizeState({
      profile: { name: 'Mia', birthDate: '2023-05-01' },
      sessions: [
        {
          id: 's1',
          kind: 'nap',
          start: '2025-01-01T10:00:00.000Z',
          end: '2025-01-01T11:00:00.000Z',
        },
      ],
    })
    expect(state.version).toBe(2)
    expect(state.children).toHaveLength(1)
    expect(state.children[0].name).toBe('Mia')
    expect(state.sessions[0].childId).toBe(state.children[0].id)
  })

  it('preserves v2 multi-child state from sync payload shape (v: 2)', () => {
    const state = normalizeState({
      v: 2,
      children: [CHILD_A, CHILD_B],
      activeChildId: CHILD_B.id,
      sessions: [
        {
          id: 's1',
          childId: CHILD_A.id,
          kind: 'nap',
          start: '2025-01-01T10:00:00.000Z',
          end: '2025-01-01T11:00:00.000Z',
        },
      ],
    })
    expect(state.children).toHaveLength(2)
    expect(state.activeChildId).toBe(CHILD_B.id)
  })

  it('preserves v2 multi-child state (version: 2)', () => {
    const state = normalizeState({
      version: 2,
      children: [CHILD_A, CHILD_B],
      activeChildId: CHILD_B.id,
      sessions: [
        {
          id: 's1',
          childId: CHILD_A.id,
          kind: 'nap',
          start: '2025-01-01T10:00:00.000Z',
          end: '2025-01-01T11:00:00.000Z',
        },
        {
          id: 's2',
          childId: CHILD_B.id,
          kind: 'night',
          start: '2025-01-01T20:00:00.000Z',
          end: '2025-01-02T06:00:00.000Z',
        },
      ],
    })
    expect(state.children).toHaveLength(2)
    expect(state.activeChildId).toBe(CHILD_B.id)
    expect(state.sessions).toHaveLength(2)
  })

  it('assigns childId to sessions missing it', () => {
    const state = normalizeState({
      version: 2,
      children: [CHILD_A],
      activeChildId: CHILD_A.id,
      sessions: [
        {
          id: 's1',
          kind: 'nap',
          start: '2025-01-01T10:00:00.000Z',
          end: null,
        } as never,
      ],
    })
    expect(state.sessions[0].childId).toBe(CHILD_A.id)
  })

  it('creates default child when v2 has empty children array', () => {
    const state = normalizeState({
      version: 2,
      children: [],
      activeChildId: '',
      sessions: [],
    })
    expect(state.children).toHaveLength(1)
    expect(state.activeChildId).toBe(state.children[0].id)
  })
})

describe('createDefaultChild', () => {
  it('uses provided name and birthDate', () => {
    const child = createDefaultChild('Test', '2024-01-01')
    expect(child.name).toBe('Test')
    expect(child.birthDate).toBe('2024-01-01')
    expect(child.color).toBe(CHILD_COLORS[0])
  })
})

describe('pickChildColor', () => {
  it('cycles colors', () => {
    expect(pickChildColor(0)).toBe(CHILD_COLORS[0])
    expect(pickChildColor(CHILD_COLORS.length)).toBe(CHILD_COLORS[0])
  })
})
