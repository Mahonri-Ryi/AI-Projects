import type { AppState } from '../types'

const STORAGE_KEY = 'little-dream-app-v1'

const defaultState: AppState = {
  profile: { name: 'Baby', birthDate: '' },
  sessions: [],
  householdCode: '',
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultState }
    const parsed = JSON.parse(raw) as AppState
    return {
      profile: parsed.profile ?? defaultState.profile,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      householdCode: parsed.householdCode ?? '',
    }
  } catch {
    return { ...defaultState }
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function generateHouseholdCode(): string {
  const words = 'bloom-cloud-dream-hush-moon-nest-pearl-rest-star-wave'
  const parts = words.split('-')
  const pick = () => parts[Math.floor(Math.random() * parts.length)]
  return `${pick()}-${pick()}-${String(Math.floor(100 + Math.random() * 900))}`
}
