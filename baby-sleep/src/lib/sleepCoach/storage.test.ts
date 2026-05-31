import { describe, expect, it } from 'vitest'
import { appendMessage, createThread, detectProviderFromKey } from './storage'

describe('sleepCoach storage helpers', () => {
  it('detects key prefixes', () => {
    expect(detectProviderFromKey('sk-abc')).toBe('openai')
    expect(detectProviderFromKey('crsr_abc')).toBe('cursor')
    expect(detectProviderFromKey('')).toBeNull()
  })

  it('titles thread from first user message', () => {
    let t = createThread('child-1')
    t = appendMessage(t, 'user', 'Why is the third nap so short?')
    expect(t.title).toContain('third nap')
    expect(t.messages).toHaveLength(1)
  })
})
