import { generateId } from '../sleepLogic'
import { normalizeProxyBaseUrl } from './proxyUrl'
import type { CoachMessage, CoachThread, SleepCoachSettings, SleepCoachState } from './types'
import { DEFAULT_COACH_SETTINGS } from './types'

const STORAGE_KEY = 'little-dream-coach-v1'

export function loadSleepCoachState(): SleepCoachState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as SleepCoachState
    return normalizeSleepCoachState(parsed)
  } catch {
    return emptyState()
  }
}

export function saveSleepCoachState(state: SleepCoachState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function emptyState(): SleepCoachState {
  return {
    version: 1,
    settings: { ...DEFAULT_COACH_SETTINGS },
    threads: [],
    activeThreadId: null,
  }
}

export function normalizeSleepCoachState(raw: Partial<SleepCoachState>): SleepCoachState {
  return {
    version: 1,
    settings: {
      ...DEFAULT_COACH_SETTINGS,
      ...raw.settings,
      apiKey: raw.settings?.apiKey ?? '',
      proxyBaseUrl: normalizeProxyBaseUrl(raw.settings?.proxyBaseUrl ?? ''),
    },
    threads: raw.threads ?? [],
    activeThreadId: raw.activeThreadId ?? null,
  }
}

export function detectProviderFromKey(apiKey: string): 'openai' | 'cursor' | null {
  const k = apiKey.trim()
  if (k.startsWith('sk-')) return 'openai'
  if (k.startsWith('crsr_')) return 'cursor'
  return null
}

export function createThread(childId: string, title = 'New chat'): CoachThread {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    childId,
    title,
    messages: [],
    updatedAt: now,
  }
}

export function appendMessage(thread: CoachThread, role: CoachMessage['role'], content: string): CoachThread {
  const msg: CoachMessage = {
    id: generateId(),
    role,
    content,
    createdAt: new Date().toISOString(),
  }
  const title =
    thread.messages.length === 0 && role === 'user'
      ? content.slice(0, 48) + (content.length > 48 ? '…' : '')
      : thread.title
  return {
    ...thread,
    title,
    messages: [...thread.messages, msg],
    updatedAt: msg.createdAt,
  }
}

export function clearCoachApiKey(settings: SleepCoachSettings): SleepCoachSettings {
  return { ...settings, apiKey: '' }
}
