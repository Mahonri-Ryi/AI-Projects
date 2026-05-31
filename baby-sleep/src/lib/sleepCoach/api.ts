import { sendCursorCoachChat } from './cursorCoach'
import type { CoachMessage, CoachProvider, SleepCoachSettings } from './types'

export interface CoachChatRequest {
  settings: SleepCoachSettings
  messages: Pick<CoachMessage, 'role' | 'content'>[]
  systemPrompt: string
  contextBlock?: string
  cursorAgentId?: string
}

export interface CoachChatResult {
  content: string
  cursorAgentId?: string
}

export type CoachApiErrorCode =
  | 'missing_key'
  | 'network'
  | 'api'
  | 'proxy'

export class CoachApiError extends Error {
  code: CoachApiErrorCode

  constructor(message: string, code: CoachApiErrorCode) {
    super(message)
    this.name = 'CoachApiError'
    this.code = code
  }
}

export function resolveCoachApiBase(settings: SleepCoachSettings): string {
  const custom = settings.proxyBaseUrl.trim()
  if (custom) return custom.replace(/\/$/, '')

  const envProxy = import.meta.env.VITE_SLEEP_COACH_PROXY as string | undefined
  if (envProxy?.trim()) return envProxy.trim().replace(/\/$/, '')

  if (import.meta.env.DEV) return '/api/coach'

  return ''
}

export { validateCursorApiKey } from './cursorAuth'

function resolveProvider(settings: SleepCoachSettings, apiKey: string): CoachProvider {
  if (settings.provider === 'cursor' || apiKey.startsWith('crsr_')) return 'cursor'
  if (settings.provider === 'openai' || apiKey.startsWith('sk-')) return 'openai'
  return settings.provider
}

export async function sendCoachChat(req: CoachChatRequest): Promise<CoachChatResult> {
  const key = req.settings.apiKey.trim()
  if (!key) {
    throw new CoachApiError('Add your Cursor API key in Coach setup.', 'missing_key')
  }

  const provider = resolveProvider(req.settings, key)

  if (provider === 'cursor') {
    const result = await sendCursorCoachChat({
      apiKey: key,
      proxyBaseUrl: req.settings.proxyBaseUrl,
      model: req.settings.model,
      systemPrompt: req.systemPrompt,
      contextBlock: req.contextBlock,
      messages: req.messages,
      cursorAgentId: req.cursorAgentId,
    })
    return { content: result.content, cursorAgentId: result.cursorAgentId }
  }

  const base = resolveCoachApiBase(req.settings)
  if (!base) {
    throw new CoachApiError(
      'A proxy URL is required on the live app (browsers block direct OpenAI calls). Add a proxy in Coach settings, or set VITE_SLEEP_COACH_PROXY at build time.',
      'proxy',
    )
  }

  const systemParts = [req.systemPrompt]
  if (req.contextBlock) {
    systemParts.push('\n\n--- Baby context (from logs) ---\n', req.contextBlock)
  }

  const body = {
    model: req.settings.model || 'gpt-4o-mini',
    messages: [
      { role: 'system' as const, content: systemParts.join('') },
      ...req.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.6,
    max_tokens: 800,
  }

  const url = `${base}/v1/chat/completions`

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new CoachApiError('Network error. Check your connection and proxy URL.', 'network')
  }

  if (!res.ok) {
    let detail = res.statusText
    try {
      const err = (await res.json()) as { error?: { message?: string } }
      detail = err.error?.message ?? detail
    } catch {
      /* ignore */
    }
    throw new CoachApiError(detail || `Request failed (${res.status})`, 'api')
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new CoachApiError('Empty response from the model.', 'api')
  }

  return { content }
}
