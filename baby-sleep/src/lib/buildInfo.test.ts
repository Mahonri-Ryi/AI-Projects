import { describe, expect, it } from 'vitest'
import { formatBuildLabel, isProductionBuild } from './buildInfo'

describe('formatBuildLabel', () => {
  it('labels dev builds', () => {
    expect(formatBuildLabel('dev')).toBe('Development build')
  })

  it('shortens git sha', () => {
    expect(formatBuildLabel('2ba8086abc123')).toBe('Release 2ba8086')
  })
})

describe('isProductionBuild', () => {
  it('treats dev as non-production', () => {
    expect(isProductionBuild('dev')).toBe(false)
    expect(isProductionBuild('abc1234')).toBe(true)
  })
})
