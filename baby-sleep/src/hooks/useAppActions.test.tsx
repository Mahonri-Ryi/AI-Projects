import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAppActions } from './useAppActions'

describe('useAppActions', () => {
  it('invokes startSleep with now for URL nap shortcut', async () => {
    const startSleep = vi.fn()
    const endSleep = vi.fn()
    window.history.replaceState({}, '', '/?action=start-nap')

    renderHook(() => useAppActions({ startSleep, endSleep }))

    await waitFor(() => {
      expect(startSleep).toHaveBeenCalledWith('nap', expect.any(String))
    })
    expect(endSleep).not.toHaveBeenCalled()
    expect(window.location.search).not.toContain('action=')
  })

  it('invokes endSleep for wake shortcut', async () => {
    const startSleep = vi.fn()
    const endSleep = vi.fn()
    window.history.replaceState({}, '', '/?action=wake')

    renderHook(() => useAppActions({ startSleep, endSleep }))

    await waitFor(() => {
      expect(endSleep).toHaveBeenCalledWith(expect.any(String))
    })
    expect(startSleep).not.toHaveBeenCalled()
  })

  it('invokes startSleep night for bedtime shortcut', async () => {
    const startSleep = vi.fn()
    const endSleep = vi.fn()
    window.history.replaceState({}, '', '/?action=start-bed')

    renderHook(() => useAppActions({ startSleep, endSleep }))

    await waitFor(() => {
      expect(startSleep).toHaveBeenCalledWith('night', expect.any(String))
    })
  })
})
