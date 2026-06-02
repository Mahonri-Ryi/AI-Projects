import { describe, expect, it } from 'vitest'
import { fromLocalDateTimeInput, toLocalDateTimeInput } from './localDateTime'

describe('localDateTime', () => {
  it('round-trips local datetime input', () => {
    const iso = '2026-06-02T03:15:00.000Z'
    const local = toLocalDateTimeInput(iso)
    expect(local).toMatch(/T\d{2}:\d{2}$/)
    expect(fromLocalDateTimeInput(local)).toBeTruthy()
  })
})
