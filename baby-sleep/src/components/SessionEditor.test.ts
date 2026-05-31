import { describe, expect, it } from 'vitest'
import { buildManualSessionDraft } from '../lib/sessionDraft'

describe('buildManualSessionDraft', () => {
  it('defaults to a completed nap with end after start', () => {
    const draft = buildManualSessionDraft('child-1')
    expect(draft.childId).toBe('child-1')
    expect(draft.kind).toBe('nap')
    expect(draft.end).not.toBeNull()
    expect(new Date(draft.end!).getTime()).toBeGreaterThan(new Date(draft.start).getTime())
  })
})
