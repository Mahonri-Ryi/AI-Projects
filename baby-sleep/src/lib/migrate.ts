import type { AppState, ChildProfile, SleepSession } from '../types'
import { generateId } from './sleepLogic'

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
  children?: ChildProfile[]
  activeChildId?: string
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

  if (parsed?.version === 2 && Array.isArray(parsed.children)) {
    let children = parsed.children.map((c, i) => ({
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

    return {
      version: 2,
      children,
      activeChildId,
      sessions: (parsed.sessions ?? []).map((s) => ({
        ...s,
        childId: s.childId || activeChildId,
      })),
      householdCode: parsed.householdCode ?? '',
    }
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

  return {
    version: 2,
    children: [child],
    activeChildId: child.id,
    sessions,
    householdCode: parsed?.householdCode ?? '',
  }
}

export function pickChildColor(index: number): string {
  return CHILD_COLORS[index % CHILD_COLORS.length]
}
