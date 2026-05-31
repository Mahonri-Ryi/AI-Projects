import { describe, expect, it } from 'vitest'
import { normalizeProxyBaseUrl } from './proxyUrl'

describe('normalizeProxyBaseUrl', () => {
  it('adds https when missing', () => {
    expect(normalizeProxyBaseUrl('little-dream-coach.foo.workers.dev')).toBe(
      'https://little-dream-coach.foo.workers.dev',
    )
  })

  it('strips trailing /cursor', () => {
    expect(normalizeProxyBaseUrl('https://x.workers.dev/cursor')).toBe('https://x.workers.dev')
  })
})
