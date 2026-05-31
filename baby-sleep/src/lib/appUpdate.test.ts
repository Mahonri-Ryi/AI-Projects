import { describe, expect, it } from 'vitest'
import { buildIsNewerThanInstalled } from './appUpdate'

describe('buildIsNewerThanInstalled', () => {
  it('detects when server build differs from installed', () => {
    expect(buildIsNewerThanInstalled('fe72621', 'abc1234')).toBe(true)
  })

  it('is false when builds match', () => {
    expect(buildIsNewerThanInstalled('fe72621', 'fe72621')).toBe(false)
  })

  it('ignores dev builds', () => {
    expect(buildIsNewerThanInstalled('dev', 'abc1234')).toBe(false)
  })
})
