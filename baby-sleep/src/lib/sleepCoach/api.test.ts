import { describe, expect, it } from 'vitest'
import { CoachApiError, resolveCoachApiBase, sendCoachChat } from './api'
import type { SleepCoachSettings } from './types'
import { DEFAULT_COACH_SETTINGS } from './types'

describe('sendCoachChat', () => {
  it('rejects cursor keys for chat', async () => {
    const settings: SleepCoachSettings = {
      ...DEFAULT_COACH_SETTINGS,
      apiKey: 'crsr_test_key_12345678901234567890123456789012',
      provider: 'cursor',
      proxyBaseUrl: 'https://proxy.example.com',
    }
    try {
      await sendCoachChat({
        settings,
        messages: [{ role: 'user', content: 'Hi' }],
        systemPrompt: 'test',
      })
      expect.fail('expected error')
    } catch (e) {
      expect(e).toBeInstanceOf(CoachApiError)
      expect((e as CoachApiError).code).toBe('cursor_unsupported')
    }
  })

  it('requires proxy when not in dev', async () => {
    const settings: SleepCoachSettings = {
      ...DEFAULT_COACH_SETTINGS,
      apiKey: 'sk-test',
      proxyBaseUrl: '',
    }
    const base = resolveCoachApiBase(settings)
    if (base) return
    await expect(
      sendCoachChat({
        settings,
        messages: [{ role: 'user', content: 'Hi' }],
        systemPrompt: 'test',
      }),
    ).rejects.toMatchObject({ code: 'proxy' })
  })
})
