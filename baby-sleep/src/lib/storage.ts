import type { AppState } from '../types'
import { createDefaultChild, normalizeState } from './migrate'

const STORAGE_KEY = 'little-dream-app-v2'

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const child = createDefaultChild()
      return {
        version: 2,
        children: [child],
        activeChildId: child.id,
        sessions: [],
        householdCode: '',
      }
    }
    return normalizeState(JSON.parse(raw))
  } catch {
    return normalizeState({ version: 2, children: [], activeChildId: '', sessions: [] })
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/** Also read legacy v1 key once and merge */
export function loadStateWithLegacy(): AppState {
  const current = localStorage.getItem(STORAGE_KEY)
  if (current) return loadState()

  const legacy = localStorage.getItem('little-dream-app-v1')
  if (legacy) {
    const migrated = normalizeState(JSON.parse(legacy))
    saveState(migrated)
    localStorage.removeItem('little-dream-app-v1')
    return migrated
  }

  return loadState()
}
