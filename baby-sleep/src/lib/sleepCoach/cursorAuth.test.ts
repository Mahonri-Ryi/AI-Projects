import { describe, expect, it } from 'vitest'
import { validateCursorApiKey } from './cursorAuth'

describe('validateCursorApiKey', () => {
  it('requires proxy on production builds', async () => {
    const result = await validateCursorApiKey(
      'crsr_' + 'a'.repeat(60),
      '',
    )
    if (import.meta.env.DEV) return
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toMatch(/proxy/i)
    }
  })
})
