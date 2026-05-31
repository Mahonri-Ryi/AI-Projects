import { describe, expect, it } from 'vitest'
import { getForgotToLogPrompt } from './forgotToLog'
import type { SleepSession } from '../types'

describe('getForgotToLogPrompt', () => {
  it('returns null when asleep', () => {
    const sessions: SleepSession[] = [
      {
        id: '1',
        childId: 'c',
        kind: 'nap',
        start: '2026-05-31T08:00:00.000Z',
        end: null,
      },
    ]
    expect(getForgotToLogPrompt(sessions, 90, new Date('2026-05-31T12:00:00'))).toBeNull()
  })

  it('prompts when awake longer than threshold', () => {
    const sessions: SleepSession[] = [
      {
        id: '1',
        childId: 'c',
        kind: 'nap',
        start: '2026-05-31T06:00:00.000Z',
        end: '2026-05-31T07:00:00.000Z',
      },
    ]
    const prompt = getForgotToLogPrompt(sessions, 90, new Date('2026-05-31T12:00:00'))
    expect(prompt?.message).toMatch(/Still awake since/)
  })
})
