import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { activeNightWake, openNapSession, openNightSession, seedOnboardedState } from '../test/fixtures'
import { useBabySleep } from './useBabySleep'

describe('useBabySleep sleep actions', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      ...globalThis.crypto,
      randomUUID: () => 'session-uuid-' + Math.random().toString(36).slice(2),
    })
  })

  it('startSleep records custom start time', () => {
    seedOnboardedState()
    const { result } = renderHook(() => useBabySleep())
    const startIso = '2026-06-01T09:15:00.000Z'

    act(() => result.current.startSleep('nap', startIso))

    const open = result.current.childSessions.find((s) => s.end === null)
    expect(open?.kind).toBe('nap')
    expect(open?.start).toBe(startIso)
  })

  it('endSleep records custom end time and rejects end before start', () => {
    const startIso = '2026-06-02T12:00:00.000Z'
    seedOnboardedState({ sessions: [openNapSession(startIso)] })
    const { result } = renderHook(() => useBabySleep())

    act(() => result.current.endSleep('2026-06-02T11:00:00.000Z'))
    expect(result.current.childSessions[0].end).toBeNull()

    const endIso = '2026-06-02T13:30:00.000Z'
    act(() => result.current.endSleep(endIso))
    expect(result.current.childSessions[0].end).toBe(endIso)
    expect(result.current.status.isAsleep).toBe(false)
  })

  it('startNightWake and endNightWake use custom timestamps', () => {
    const nightStart = '2026-06-01T20:00:00.000Z'
    const night = openNightSession(nightStart, 'night-1')
    seedOnboardedState({ sessions: [night] })
    const { result } = renderHook(() => useBabySleep())

    const wakeStart = '2026-06-02T01:15:00.000Z'
    act(() => result.current.startNightWake(wakeStart))
    expect(result.current.status.activeNightWake?.start).toBe(wakeStart)

    const wakeEnd = '2026-06-02T01:45:00.000Z'
    act(() => result.current.endNightWake(wakeEnd))
    const wake = (result.current.childNightWakes ?? []).find((w) => w.id)
    expect(wake?.end).toBe(wakeEnd)
    expect(result.current.status.activeNightWake).toBeNull()
  })

  it('endSleep closes open night wake when ending the night session', () => {
    const night = openNightSession('2026-06-01T20:00:00.000Z', 'night-1')
    const wake = activeNightWake('night-1', '2026-06-02T02:00:00.000Z')
    seedOnboardedState({ sessions: [night], nightWakes: [wake] })
    const { result } = renderHook(() => useBabySleep())

    act(() => result.current.endSleep('2026-06-02T07:00:00.000Z'))
    expect(result.current.childSessions[0].end).toBe('2026-06-02T07:00:00.000Z')
    expect(result.current.childNightWakes[0].end).toBe('2026-06-02T07:00:00.000Z')
  })

  it('does not start a second open session', () => {
    seedOnboardedState({ sessions: [openNapSession('2026-06-02T10:00:00.000Z')] })
    const { result } = renderHook(() => useBabySleep())

    act(() => result.current.startSleep('night', '2026-06-02T20:00:00.000Z'))
    expect(result.current.childSessions.filter((s) => s.end === null)).toHaveLength(1)
    expect(result.current.childSessions[0].kind).toBe('nap')
  })
})
