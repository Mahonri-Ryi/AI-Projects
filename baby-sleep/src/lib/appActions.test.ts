import { describe, expect, it } from 'vitest'
import { parseAppAction } from './appActions'

describe('parseAppAction', () => {
  it('parses nap and bed aliases', () => {
    expect(parseAppAction('?action=start-nap')).toBe('start-nap')
    expect(parseAppAction('?action=nap')).toBe('start-nap')
    expect(parseAppAction('?action=bedtime')).toBe('start-bed')
    expect(parseAppAction('?action=wake-up')).toBe('wake')
  })

  it('returns null for unknown', () => {
    expect(parseAppAction('?action=foo')).toBeNull()
  })
})
