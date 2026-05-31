import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  getPermissionUiState,
  isInstalledAsPwa,
  permissionStatusLabel,
} from './notificationPermission'

describe('isInstalledAsPwa', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('standalone'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
  })

  it('detects standalone display mode', () => {
    expect(isInstalledAsPwa()).toBe(true)
  })
})

describe('getPermissionUiState', () => {
  it('returns granted when permission is granted in standalone PWA', () => {
    class MockNotification {
      static permission = 'granted'
    }
    vi.stubGlobal('Notification', MockNotification)
    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: {},
    })
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('standalone'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    expect(getPermissionUiState()).toBe('granted')
    expect(permissionStatusLabel('granted')).toBe('Allowed on this phone')
  })
})
