export type PermissionUiState = 'unsupported' | 'needs-pwa' | 'default' | 'granted' | 'denied'

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function serviceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
}

/** Home-screen installed PWA (required for reliable phone notifications on iOS). */
export function isInstalledAsPwa(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    nav.standalone === true
  )
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!notificationsSupported()) return 'unsupported'
  return Notification.permission
}

export function getPermissionUiState(): PermissionUiState {
  if (!notificationsSupported() || !serviceWorkerSupported()) return 'unsupported'
  if (!isInstalledAsPwa()) return 'needs-pwa'
  const perm = Notification.permission
  if (perm === 'granted') return 'granted'
  if (perm === 'denied') return 'denied'
  return 'default'
}

/**
 * Request OS notification permission. Call synchronously from a click handler.
 * Returns the resulting permission state.
 */
export async function requestPhoneNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported'

  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'

  try {
    const result = await Notification.requestPermission()
    return result
  } catch {
    return Notification.permission
  }
}

export function permissionStatusLabel(state: PermissionUiState): string {
  switch (state) {
    case 'granted':
      return 'Allowed on this phone'
    case 'denied':
      return 'Blocked on this phone'
    case 'default':
      return 'Not allowed yet'
    case 'needs-pwa':
      return 'Add to Home Screen first'
    case 'unsupported':
      return 'Not supported in this browser'
  }
}
