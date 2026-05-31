import { CoachApiError } from './api'
import { normalizeProxyBaseUrl } from './proxyUrl'

const CURSOR_API = 'https://api.cursor.com'

export interface CursorAgentRefs {
  agentId: string
  runId: string
}

function basicAuthHeader(apiKey: string): string {
  return `Basic ${btoa(`${apiKey.trim()}:`)}`
}

/** Cloud Agents API: Basic auth is the documented default. */
function authHeader(apiKey: string): string {
  return basicAuthHeader(apiKey)
}

async function cursorRequestWithAuth(
  proxyBase: string,
  apiKey: string,
  path: string,
  init: RequestInit,
): Promise<Response> {
  let res = await cursorRequest(proxyBase, apiKey, path, init, basicAuthHeader(apiKey))
  if (res.status === 401) {
    res = await cursorRequest(
      proxyBase,
      apiKey,
      path,
      init,
      `Bearer ${apiKey.trim()}`,
    )
  }
  return res
}

function joinBase(proxyBase: string, path: string): string {
  const base = proxyBase.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

async function cursorRequest(
  proxyBase: string,
  apiKey: string,
  path: string,
  init: RequestInit,
  authorization?: string,
): Promise<Response> {
  const url = proxyBase ? joinBase(proxyBase, path) : `${CURSOR_API}${path}`
  const auth = authorization ?? authHeader(apiKey)
  const headers: Record<string, string> = { Authorization: auth }
  if (init.method !== 'GET') {
    headers['Content-Type'] = 'application/json'
  }
  return fetch(url, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers as Record<string, string> | undefined),
    },
  })
}

export function resolveCursorProxyBase(settings: { proxyBaseUrl: string }): string {
  const custom = normalizeProxyBaseUrl(settings.proxyBaseUrl)
  if (custom) return `${custom}/cursor`

  const envProxy = import.meta.env.VITE_SLEEP_COACH_PROXY as string | undefined
  if (envProxy?.trim()) return `${envProxy.trim().replace(/\/$/, '')}/cursor`

  if (import.meta.env.DEV) return '/api/cursor'

  return ''
}

export function buildCursorPromptText(
  systemPrompt: string,
  contextBlock: string | undefined,
  messages: { role: string; content: string }[],
): string {
  const parts: string[] = [systemPrompt]
  if (contextBlock) {
    parts.push('\n\n--- Baby context (from logs) ---\n', contextBlock)
  }
  if (messages.length > 0) {
    parts.push('\n\n--- Conversation ---')
    for (const m of messages) {
      const who = m.role === 'user' ? 'Parent' : m.role === 'assistant' ? 'Coach' : 'System'
      parts.push(`\n${who}: ${m.content}`)
    }
  }
  parts.push('\n\nReply as Sleep Coach to the Parent’s latest message. Be concise and practical.')
  return parts.join('')
}

export async function createCursorAgentRun(
  proxyBase: string,
  apiKey: string,
  promptText: string,
  modelId: string,
): Promise<CursorAgentRefs> {
  const res = await cursorRequestWithAuth(proxyBase, apiKey, '/v1/agents', {
    method: 'POST',
    body: JSON.stringify({
      prompt: { text: promptText },
      ...(modelId ? { model: { id: modelId } } : {}),
    }),
  })

  if (!res.ok) {
    throw await apiErrorFromResponse(res)
  }

  const data = (await res.json()) as {
    agent?: { id?: string }
    run?: { id?: string }
  }
  const agentId = data.agent?.id
  const runId = data.run?.id
  if (!agentId || !runId) {
    throw new CoachApiError('Cursor did not return agent/run ids.', 'api')
  }
  return { agentId, runId }
}

export async function followUpCursorAgentRun(
  proxyBase: string,
  apiKey: string,
  agentId: string,
  promptText: string,
): Promise<CursorAgentRefs> {
  const res = await cursorRequestWithAuth(proxyBase, apiKey, `/v1/agents/${agentId}/runs`, {
    method: 'POST',
    body: JSON.stringify({
      prompt: { text: promptText },
    }),
  })

  if (!res.ok) {
    throw await apiErrorFromResponse(res)
  }

  const data = (await res.json()) as { run?: { id?: string } }
  const runId = data.run?.id
  if (!runId) {
    throw new CoachApiError('Cursor did not return a run id.', 'api')
  }
  return { agentId, runId }
}

function extractTextFromStreamChunk(obj: Record<string, unknown>): string {
  if (typeof obj.result === 'string' && obj.type === 'result') {
    return obj.result
  }

  const message = obj.message as { content?: Array<{ type?: string; text?: string }> } | undefined
  if (message?.content) {
    return message.content
      .filter((c) => c.type === 'text' && c.text)
      .map((c) => c.text!)
      .join('')
  }

  const text = obj.text
  if (typeof text === 'string') return text

  const delta = obj.delta as { text?: string } | undefined
  if (typeof delta?.text === 'string') return delta.text

  return ''
}

export function parseCursorStreamBody(body: string): string {
  const deltas: string[] = []
  let finalResult = ''

  const lines = body.split('\n')
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    let jsonStr = line
    if (line.startsWith('data:')) {
      jsonStr = line.slice(5).trim()
    }
    if (jsonStr === '[DONE]') continue

    try {
      const obj = JSON.parse(jsonStr) as Record<string, unknown>
      if (obj.type === 'result' && typeof obj.result === 'string') {
        finalResult = obj.result
        continue
      }
      if (obj.type === 'assistant' && obj.timestamp_ms != null) {
        const t = extractTextFromStreamChunk(obj)
        if (t) deltas.push(t)
        continue
      }
      if (obj.type === 'assistant') {
        continue
      }
      const t = extractTextFromStreamChunk(obj)
      if (t) deltas.push(t)
    } catch {
      /* non-json line */
    }
  }

  if (finalResult.trim()) return finalResult.trim()
  const joined = deltas.join('')
  return joined.trim()
}

export async function waitForCursorRunText(
  proxyBase: string,
  apiKey: string,
  agentId: string,
  runId: string,
  maxWaitMs = 120_000,
): Promise<string> {
  const started = Date.now()

  while (Date.now() - started < maxWaitMs) {
    const streamRes = await cursorRequestWithAuth(
      proxyBase,
      apiKey,
      `/v1/agents/${agentId}/runs/${runId}/stream`,
      { method: 'GET', headers: {} },
    )

    if (streamRes.ok) {
      const body = await streamRes.text()
      const text = parseCursorStreamBody(body)
      if (text) return text
    }

    const statusRes = await cursorRequestWithAuth(
      proxyBase,
      apiKey,
      `/v1/agents/${agentId}/runs/${runId}`,
      { method: 'GET', headers: {} },
    )

    if (statusRes.ok) {
      const status = (await statusRes.json()) as {
        status?: string
        result?: { text?: string; content?: string }
        output?: string
      }
      const st = (status.status ?? '').toUpperCase()
      const direct =
        status.result?.text ??
        status.result?.content ??
        (typeof status.output === 'string' ? status.output : '')
      if (direct.trim()) return direct.trim()
      if (st === 'FAILED' || st === 'ERROR' || st === 'CANCELLED') {
        throw new CoachApiError(`Cursor run ended with status: ${status.status}`, 'api')
      }
      if (st === 'COMPLETED' || st === 'FINISHED' || st === 'SUCCEEDED') {
        const again = await cursorRequestWithAuth(
          proxyBase,
          apiKey,
          `/v1/agents/${agentId}/runs/${runId}/stream`,
          { method: 'GET', headers: {} },
        )
        if (again.ok) {
          const text = parseCursorStreamBody(await again.text())
          if (text) return text
        }
        throw new CoachApiError('Cursor finished but returned no text. Try again.', 'api')
      }
    }

    await sleep(2500)
  }

  throw new CoachApiError('Cursor is taking too long. Try a shorter question.', 'api')
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function apiErrorFromResponse(res: Response): Promise<CoachApiError> {
  let detail = res.statusText
  try {
    const err = (await res.json()) as { message?: string; error?: string | { message?: string } }
    if (typeof err.message === 'string') detail = err.message
    else if (typeof err.error === 'string') detail = err.error
    else if (err.error && typeof err.error === 'object' && err.error.message) {
      detail = err.error.message
    }
  } catch {
    /* ignore */
  }
  if (res.status === 401) {
    return new CoachApiError('Invalid Cursor API key. Create one at cursor.com/dashboard → API Keys.', 'api')
  }
  if (res.status === 404) {
    return new CoachApiError(
      'Proxy or API path not found (404). Set Proxy URL to https://YOUR-WORKER.workers.dev (include https://).',
      'api',
    )
  }
  return new CoachApiError(detail || `Cursor API error (${res.status})`, 'api')
}

export interface SendCursorCoachArgs {
  apiKey: string
  proxyBaseUrl: string
  model: string
  systemPrompt: string
  contextBlock?: string
  messages: { role: string; content: string }[]
  cursorAgentId?: string
}

export async function sendCursorCoachChat(args: SendCursorCoachArgs): Promise<{
  content: string
  cursorAgentId: string
}> {
  const proxyBase = resolveCursorProxyBase({ proxyBaseUrl: args.proxyBaseUrl })
  if (!proxyBase) {
    throw new CoachApiError(
      'A proxy URL is required for Cursor on the live app (browser CORS). Add your Cloudflare worker URL in Coach setup (see coach-proxy/README).',
      'proxy',
    )
  }

  const modelId = args.model.trim() || 'composer-2'
  const latestUser = [...args.messages].reverse().find((m) => m.role === 'user')
  if (!latestUser) {
    throw new CoachApiError('No message to send.', 'api')
  }

  let agentId = args.cursorAgentId
  let runId: string

  if (agentId) {
    const refs = await followUpCursorAgentRun(proxyBase, args.apiKey, agentId, latestUser.content)
    runId = refs.runId
  } else {
    const promptText = buildCursorPromptText(args.systemPrompt, args.contextBlock, args.messages)
    const refs = await createCursorAgentRun(proxyBase, args.apiKey, promptText, modelId)
    agentId = refs.agentId
    runId = refs.runId
  }

  const content = await waitForCursorRunText(proxyBase, args.apiKey, agentId, runId)
  return { content, cursorAgentId: agentId }
}
