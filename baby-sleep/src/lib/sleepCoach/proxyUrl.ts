/** Normalize proxy URL so fetch() does not treat it as a relative path on GitHub Pages. */
export function normalizeProxyBaseUrl(raw: string): string {
  let url = raw.trim().replace(/\/$/, '')
  if (!url) return ''

  // User may paste "little-dream-coach.foo.workers.dev/cursor" — strip; we add /cursor in code.
  url = url.replace(/\/cursor\/?$/i, '')

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }

  return url.replace(/\/$/, '')
}
