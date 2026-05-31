import { resolveCursorProxyBase } from './cursorCoach'

export async function validateCursorApiKey(
  apiKey: string,
  proxyBaseUrl = '',
): Promise<{ ok: boolean; label?: string }> {
  const key = apiKey.trim()
  if (!key) return { ok: false }

  const proxyBase = resolveCursorProxyBase({ proxyBaseUrl })
  const url = proxyBase ? `${proxyBase.replace(/\/$/, '')}/v1/me` : 'https://api.cursor.com/v1/me'

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    })
    if (!res.ok) return { ok: false }
    const data = (await res.json()) as { email?: string; name?: string; userEmail?: string }
    const label = data.email ?? data.userEmail ?? data.name ?? 'Cursor account'
    return { ok: true, label }
  } catch {
    return { ok: false }
  }
}
