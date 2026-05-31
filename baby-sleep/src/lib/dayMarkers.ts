import { format } from 'date-fns'
import type { AppState, DayMarker, DayMarkerTag } from '../types'
import { generateId } from './sleepLogic'

export function markersForChild(state: AppState, childId: string): DayMarker[] {
  return (state.dayMarkers ?? []).filter((m) => m.childId === childId)
}

export function markerForDay(
  state: AppState,
  childId: string,
  date: string,
): DayMarker | undefined {
  return (state.dayMarkers ?? []).find((m) => m.childId === childId && m.date === date)
}

export function upsertDayMarker(
  state: AppState,
  childId: string,
  date: string,
  tag: DayMarkerTag,
  note?: string,
): AppState {
  const existing = markerForDay(state, childId, date)
  const next: DayMarker = existing
    ? { ...existing, tag, note }
    : { id: generateId(), childId, date, tag, note }

  const rest = (state.dayMarkers ?? []).filter(
    (m) => !(m.childId === childId && m.date === date),
  )
  return { ...state, dayMarkers: [...rest, next] }
}

export function removeDayMarker(state: AppState, markerId: string): AppState {
  return {
    ...state,
    dayMarkers: (state.dayMarkers ?? []).filter((m) => m.id !== markerId),
  }
}

export function todayDateString(now = new Date()): string {
  return format(now, 'yyyy-MM-dd')
}
