import { describe, expect, it } from 'vitest'
import {
  ALL_SOURCE_IDS,
  getAllSources,
  getSources,
  SOURCES_WAKE_WINDOWS,
} from './researchCatalog'

describe('researchCatalog', () => {
  it('returns sources for known ids', () => {
    const sources = getSources(SOURCES_WAKE_WINDOWS)
    expect(sources.length).toBe(SOURCES_WAKE_WINDOWS.length)
    for (const s of sources) {
      expect(s.title.length).toBeGreaterThan(0)
      expect(s.url).toMatch(/^https:\/\//)
    }
  })

  it('all catalog entries have unique ids', () => {
    const all = getAllSources()
    const ids = all.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers every defined source id', () => {
    expect(getAllSources().length).toBe(ALL_SOURCE_IDS.length)
  })
})
