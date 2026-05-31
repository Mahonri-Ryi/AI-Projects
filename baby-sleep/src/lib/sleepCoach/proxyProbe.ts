import { normalizeProxyBaseUrl } from './proxyUrl'

/** Shown when the Worker URL serves static app assets instead of coach-proxy/worker.js */
export const PROXY_MISDEPLOY_MESSAGE =
  'This Worker URL is serving the Little Dream app (HTML), not the Coach proxy. In Cloudflare → your Worker → Builds, set Root directory to baby-sleep/coach-proxy and redeploy. Open the URL in a browser — you should see JSON with "Little Dream Sleep Coach proxy", not the purple app. See baby-sleep/coach-proxy/CLOUDFLARE-GIT-SETUP.md in the repo.'

export const PROXY_UNREACHABLE_MESSAGE =
  'Could not reach the proxy (network or CORS). That often happens when the Worker deploys static files instead of coach-proxy/worker.js — fix the Cloudflare build root, then Test again.'

export type CoachProxyProbe = 'ok' | 'misdeployed' | 'unknown' | 'unreachable'

/** GET worker root (no auth). Health JSON = proxy; HTML = wrong Cloudflare build root. */
export async function probeCoachProxyRoot(proxyBaseUrl: string): Promise<CoachProxyProbe> {
  const base = normalizeProxyBaseUrl(proxyBaseUrl)
  if (!base) return 'unknown'

  try {
    const res = await fetch(`${base}/`, { method: 'GET' })
    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('text/html')) return 'misdeployed'

    const text = await res.text()
    try {
      const data = JSON.parse(text) as { ok?: boolean; service?: string }
      if (
        data.ok === true ||
        (typeof data.service === 'string' && data.service.includes('Sleep Coach proxy'))
      ) {
        return 'ok'
      }
    } catch {
      /* not json */
    }
    return 'unknown'
  } catch {
    return 'unreachable'
  }
}
