import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getSources, SOURCES_WAKE_WINDOWS } from '../../data/researchCatalog'
import { ResearchLinks } from './ResearchLinks'

describe('ResearchLinks', () => {
  it('renders linked sources', () => {
    const sources = getSources(SOURCES_WAKE_WINDOWS)
    render(<ResearchLinks sources={sources} title="Why we suggest this" />)
    expect(screen.getByText('Why we suggest this')).toBeInTheDocument()
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(sources.length)
    for (const s of sources) {
      expect(links.some((el) => el.getAttribute('href') === s.url)).toBe(true)
    }
  })

  it('renders nothing when sources empty', () => {
    const { container } = render(<ResearchLinks sources={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
