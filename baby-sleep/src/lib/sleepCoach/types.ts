export type CoachProvider = 'openai' | 'cursor'

export type CoachMessageRole = 'user' | 'assistant' | 'system'

export interface CoachMessage {
  id: string
  role: CoachMessageRole
  content: string
  createdAt: string
}

export interface CoachThread {
  id: string
  childId: string
  title: string
  messages: CoachMessage[]
  updatedAt: string
  /** Cursor Cloud Agent id for follow-up messages in this thread */
  cursorAgentId?: string
}

export interface SleepCoachSettings {
  provider: CoachProvider
  /** Stored only on device — never sent to Little Dream servers */
  apiKey: string
  /** Optional CORS proxy, e.g. Cloudflare Worker (see coach-proxy/README) */
  proxyBaseUrl: string
  includeLogContext: boolean
  model: string
}

export interface SleepCoachState {
  version: 1
  settings: SleepCoachSettings
  threads: CoachThread[]
  activeThreadId: string | null
}

export const DEFAULT_COACH_SETTINGS: SleepCoachSettings = {
  provider: 'cursor',
  apiKey: '',
  proxyBaseUrl: '',
  includeLogContext: true,
  model: 'composer-2',
}
