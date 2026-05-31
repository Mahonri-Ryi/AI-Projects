import type { CoachMessage, CoachProvider, SleepCoachSettings } from './types'

export interface CoachChatRequest {
  settings: SleepCoachSettings
  messages: Pick<CoachMessage, 'role' | 'content'>[]
  systemPrompt: string
  contextBlock?: string
}

export interface CoachChatResult {
  content: string
}

export type CoachApiErrorCode =
  | 'missing_key'
  | 'cursor_unsupported'
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

export async function validateCursorApiKey(apiKey: string): Promise<{ ok: boolean; label?: string }> {
  const key = apiKey.trim()
  if (!key) return { ok: false }

  try {
    const res = await fetch('https://api.cursor.com/v1/me', {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    })
    if (!res.ok) return { ok: false }
    const data = (await res.json()) as { email?: string; name?: string }
    const label = data.email ?? data.name ?? 'Cursor account'
    return { ok: true, label }
  } catch {
    return { ok: false }
  }
}

export async function sendCoachChat(req: CoachChatRequest): Promise<CoachChatResult> {
  const key = req.settings.apiKey.trim()
  if (!key) {
    throw new CoachApiError('Add your API key in Coach settings.', 'missing_key')
  }

  const provider: CoachProvider =
    req.settings.provider === 'cursor' || key.startsWith('crsr_')
      ? 'cursor'
      : 'openai'

  if (provider === 'cursor') {
    throw new CoachApiError(
      'Cursor API keys (crsr_…) are for Cloud Agents and the IDE, not parent Q&A chat. Use an OpenAI API key (sk-…) for Sleep Coach, or add the same OpenAI key you use under Cursor Settings → Models.',
      'cursor_unsupported',
    )
  }

  const base = resolveCoachApiBase(req.settings)
  if (!base) {
    throw new CoachApiError(
      'A proxy URL is required on the live app (browsers block direct OpenAI calls). Add a proxy in Coach settings, or set VITE_SLEEP_COACH_PROXY at build time. See coach-proxy/README in the repo.',
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
    throw new CoachApiError(
      'Network error. Check your connection and proxy URL.',
      'network',
    )
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
