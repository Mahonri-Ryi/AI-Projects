import { useCallback, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const CHECK_INTERVAL_MS = 60 * 60 * 1000

export function usePwaUpdate() {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      const check = () => void registration.update()
      check()
      window.setInterval(check, CHECK_INTERVAL_MS)
    },
  })

  const [checking, setChecking] = useState(false)
  const [checkMessage, setCheckMessage] = useState<string | null>(null)

  const checkForUpdate = useCallback(async () => {
    setChecking(true)
    setCheckMessage(null)
    try {
      if (!('serviceWorker' in navigator)) {
        setCheckMessage('Updates are checked when you open the app in a browser that supports offline mode.')
        return
      }
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        setCheckMessage('No cached copy yet — reload once while online to enable update checks.')
        return
      }
      await registration.update()
      if (needRefresh) {
        setCheckMessage('A new version is ready. Tap “Refresh app” below.')
      } else {
        setCheckMessage('You’re on the latest version we can see right now.')
      }
    } catch {
      setCheckMessage('Could not check right now. Try again when you’re online.')
    } finally {
      setChecking(false)
    }
  }, [needRefresh])

  const applyUpdate = useCallback(() => {
    void updateServiceWorker(true)
  }, [updateServiceWorker])

  const dismissOfflineReady = useCallback(() => {
    setOfflineReady(false)
  }, [setOfflineReady])

  return {
    needRefresh,
    offlineReady,
    checking,
    checkMessage,
    checkForUpdate,
    applyUpdate,
    dismissOfflineReady,
  }
}
