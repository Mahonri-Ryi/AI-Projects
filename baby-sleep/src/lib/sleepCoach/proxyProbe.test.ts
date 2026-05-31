import { afterEach, describe, expect, it, vi } from 'vitest'
import { probeCoachProxyRoot } from './proxyProbe'

describe('probeCoachProxyRoot', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('detects misdeployed static site (HTML)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        headers: { get: () => 'text/html; charset=utf-8' },
        text: async () => '<!doctype html><html><title>Little Dream</title>',
      }),
    )
    expect(await probeCoachProxyRoot('https://little-dream-coach.example.workers.dev')).toBe(
      'misdeployed',
    )
  })

  it('detects healthy proxy JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        headers: { get: () => 'application/json' },
        text: async () =>
          JSON.stringify({ ok: true, service: 'Little Dream Sleep Coach proxy' }),
      }),
    )
    expect(await probeCoachProxyRoot('https://proxy.example.workers.dev/')).toBe('ok')
  })

  it('returns unreachable on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    expect(await probeCoachProxyRoot('https://proxy.example.workers.dev')).toBe('unreachable')
  })
})
