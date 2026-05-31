import { format } from 'date-fns'
import type { AppState, ChecklistItem, WindDownChecklistState } from '../types'
import { generateId } from './sleepLogic'

export const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'nap-dim', kind: 'nap', label: 'Dim lights' },
  { id: 'nap-sack', kind: 'nap', label: 'Sleep sack / swaddle' },
  { id: 'nap-noise', kind: 'nap', label: 'White noise on' },
  { id: 'bed-dim', kind: 'bed', label: 'Dim lights' },
  { id: 'bed-routine', kind: 'bed', label: 'Bath or calm routine' },
  { id: 'bed-sack', kind: 'bed', label: 'Sleep sack' },
  { id: 'bed-noise', kind: 'bed', label: 'White noise on' },
]

export function normalizeChecklist(
  raw: WindDownChecklistState | undefined,
  now = new Date(),
): WindDownChecklistState {
  const today = format(now, 'yyyy-MM-dd')
  const items = raw?.items?.length ? raw.items : DEFAULT_CHECKLIST_ITEMS
  const checkedDate = raw?.checkedDate === today ? today : today
  const checkedIds = raw?.checkedDate === today ? raw.checkedIds ?? [] : []
  return { items, checkedDate, checkedIds }
}

export function toggleChecklistItem(state: AppState, itemId: string, now = new Date()): AppState {
  const checklist = normalizeChecklist(state.checklist, now)
  const has = checklist.checkedIds.includes(itemId)
  return {
    ...state,
    checklist: {
      ...checklist,
      checkedIds: has
        ? checklist.checkedIds.filter((id) => id !== itemId)
        : [...checklist.checkedIds, itemId],
    },
  }
}

export function addChecklistItem(
  state: AppState,
  kind: 'nap' | 'bed',
  label: string,
  now = new Date(),
): AppState {
  const checklist = normalizeChecklist(state.checklist, now)
  const item: ChecklistItem = { id: generateId(), kind, label: label.trim() || 'New step' }
  return {
    ...state,
    checklist: { ...checklist, items: [...checklist.items, item] },
  }
}

export function removeChecklistItem(state: AppState, itemId: string, now = new Date()): AppState {
  const checklist = normalizeChecklist(state.checklist, now)
  return {
    ...state,
    checklist: {
      ...checklist,
      items: checklist.items.filter((i) => i.id !== itemId),
      checkedIds: checklist.checkedIds.filter((id) => id !== itemId),
    },
  }
}
