import { resolveCursorProxyBase } from './cursorCoach'

export type CursorKeyValidationResult =
  | { ok: true; label: string }
  | { ok: false; message: string }

function normalizeKey(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, '')
}

function basicAuthHeader(apiKey: string): string {
  const token = btoa(`${apiKey}:`)
  return `Basic ${token}`
}

function bearerAuthHeader(apiKey: string): string {
  return `Bearer ${apiKey}`
}

async function tryMeEndpoint(
  url: string,
  apiKey: string,
): Promise<{ ok: true; label: string } | { ok: false; status: number; detail: string }> {
  const attempts = [
    { name: 'basic', header: basicAuthHeader(apiKey) },
    { name: 'bearer', header: bearerAuthHeader(apiKey) },
  ]

  let lastStatus = 0
  let lastDetail = ''

  for (const { header } of attempts) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: header },
      })
      lastStatus = res.status
      if (res.ok) {
        const data = (await res.json()) as Record<string, unknown>
        const label =
          (typeof data.email === 'string' && data.email) ||
          (typeof data.userEmail === 'string' && data.userEmail) ||
          (typeof data.name === 'string' && data.name) ||
          (typeof data.login === 'string' && data.login) ||
          'Cursor account'
        return { ok: true, label }
      }
      try {
        const err = (await res.json()) as { message?: string; error?: string }
        lastDetail = err.message ?? err.error ?? res.statusText
      } catch {
        lastDetail = res.statusText
      }
    } catch {
      lastDetail = 'network error'
      lastStatus = 0
    }
  }

  return { ok: false, status: lastStatus, detail: lastDetail }
}

export async function validateCursorApiKey(
  apiKey: string,
  proxyBaseUrl = '',
): Promise<CursorKeyValidationResult> {
  const key = normalizeKey(apiKey)
  if (!key) {
    return { ok: false, message: 'Paste your API key first.' }
  }

  if (!key.startsWith('crsr_')) {
    return {
      ok: false,
      message: 'Expected a Cursor key starting with crsr_. Create one under Dashboard → API Keys.',
    }
  }

  const proxyBase = resolveCursorProxyBase({ proxyBaseUrl })
  if (!proxyBase) {
    return {
      ok: false,
      message:
        'On the installed app, add a Proxy URL above first (deploy coach-proxy/worker.js), then Test again. Local dev works without it.',
    }
  }

  const bases = [`${proxyBase.replace(/\/$/, '')}/v1/me`, `${proxyBase.replace(/\/$/, '')}/v0/me`]

  let lastStatus = 0
  let lastDetail = ''

  for (const url of bases) {
    const result = await tryMeEndpoint(url, key)
    if (result.ok) return result
    lastStatus = result.status
    lastDetail = result.detail
  }

  if (lastStatus === 401) {
    return {
      ok: false,
      message:
        'Key rejected (401). Use a Cloud Agents key from cursor.com/dashboard → API Keys — not an Admin/Analytics key from team settings.',
    }
  }
  if (lastStatus === 0) {
    return {
      ok: false,
      message:
        'Could not reach Cursor. Check the proxy URL and that coach-proxy/worker.js is deployed.',
    }
  }
  return {
    ok: false,
    message: lastDetail ? `Cursor API: ${lastDetail}` : `Cursor API error (${lastStatus})`,
  }
}
