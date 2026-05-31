import { describe, expect, it } from 'vitest'
import { CoachApiError, sendCoachChat } from './api'
import { parseCursorStreamBody } from './cursorCoach'
import type { SleepCoachSettings } from './types'
import { DEFAULT_COACH_SETTINGS } from './types'

describe('parseCursorStreamBody', () => {
  it('reads result event', () => {
    const body = [
      '{"type":"assistant","timestamp_ms":1,"message":{"content":[{"type":"text","text":"Hi"}]}}',
      '{"type":"result","subtype":"success","result":"Hello parent!"}',
    ].join('\n')
    expect(parseCursorStreamBody(body)).toBe('Hello parent!')
  })
})

describe('sendCoachChat', () => {
  it('requires proxy for openai when not in dev', async () => {
    const settings: SleepCoachSettings = {
      ...DEFAULT_COACH_SETTINGS,
      provider: 'openai',
      apiKey: 'sk-test',
      proxyBaseUrl: '',
    }
    const base = import.meta.env.DEV ? 'skip' : ''
    if (base === 'skip') return

    try {
      await sendCoachChat({
        settings,
        messages: [{ role: 'user', content: 'Hi' }],
        systemPrompt: 'test',
      })
      expect.fail('expected error')
    } catch (e) {
      expect(e).toBeInstanceOf(CoachApiError)
      expect((e as CoachApiError).code).toBe('proxy')
    }
  })
})
