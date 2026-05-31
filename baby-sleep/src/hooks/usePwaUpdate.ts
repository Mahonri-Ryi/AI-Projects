import { useCallback, useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import {
  fetchRemoteVersion,
  hardRefreshAppCache,
  isRemoteVersionNewer,
} from '../lib/appUpdate'
import { formatBuildLabel, getBuildId } from '../lib/buildInfo'

const CHECK_INTERVAL_MS = 5 * 60 * 1000

export function usePwaUpdate() {
  const {
    needRefresh: [swNeedRefresh],
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
    onNeedRefresh() {
      // autoUpdate will activate; we also reload on controllerchange below
    },
  })

  const [remoteBuildLabel, setRemoteBuildLabel] = useState<string | null>(null)
  const [serverUpdateAvailable, setServerUpdateAvailable] = useState(false)
  const [checking, setChecking] = useState(false)
  const [checkMessage, setCheckMessage] = useState<string | null>(null)
  const [cacheRefreshing, setCacheRefreshing] = useState(false)
  const reloadedForUpdate = useRef(false)

  const needRefresh = swNeedRefresh || serverUpdateAvailable

  const checkForUpdate = useCallback(async () => {
    setChecking(true)
    setCheckMessage(null)
    try {
      if (!('serviceWorker' in navigator)) {
        const remote = await fetchRemoteVersion()
        if (remote && isRemoteVersionNewer(remote)) {
          setServerUpdateAvailable(true)
          setRemoteBuildLabel(formatBuildLabel(remote.buildId))
          setCheckMessage(
            `New version ${formatBuildLabel(remote.buildId)} is live. Use “Clear cache & reload” below.`,
          )
        } else {
          setCheckMessage('You appear to be on the latest version.')
        }
        return
      }

      const registration = await navigator.serviceWorker.getRegistration()
      await registration?.update()

      const remote = await fetchRemoteVersion()
      if (remote && isRemoteVersionNewer(remote)) {
        setServerUpdateAvailable(true)
        setRemoteBuildLabel(formatBuildLabel(remote.buildId))
        setCheckMessage(
          `New version ${formatBuildLabel(remote.buildId)} is available. Tap Refresh or Clear cache & reload.`,
        )
        return
      }

      if (swNeedRefresh) {
        setCheckMessage('A new version is ready. Tap “Refresh app” below.')
      } else {
        setServerUpdateAvailable(false)
        setRemoteBuildLabel(null)
        setCheckMessage(`You’re on ${formatBuildLabel(getBuildId())} — latest we can see.`)
      }
    } catch {
      setCheckMessage('Could not check right now. Try again when you’re online.')
    } finally {
      setChecking(false)
    }
  }, [swNeedRefresh])

  useEffect(() => {
    const runCheck = () => void checkForUpdate()
    const initial = window.setTimeout(runCheck, 0)
    const onFocus = () => runCheck()
    window.addEventListener('focus', onFocus)
    const interval = window.setInterval(runCheck, CHECK_INTERVAL_MS)
    return () => {
      window.clearTimeout(initial)
      window.removeEventListener('focus', onFocus)
      window.clearInterval(interval)
    }
  }, [checkForUpdate])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onControllerChange = () => {
      if (reloadedForUpdate.current) return
      reloadedForUpdate.current = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  const applyUpdate = useCallback(() => {
    if (swNeedRefresh) {
      void updateServiceWorker(true)
      return
    }
    void hardRefreshAppCache()
  }, [swNeedRefresh, updateServiceWorker])

  const clearCacheAndReload = useCallback(async () => {
    setCacheRefreshing(true)
    try {
      await hardRefreshAppCache()
    } catch {
      setCacheRefreshing(false)
      setCheckMessage('Could not reset cache. Try force-closing the app and opening again.')
    }
  }, [])

  const dismissOfflineReady = useCallback(() => {
    setOfflineReady(false)
  }, [setOfflineReady])

  return {
    needRefresh,
    remoteBuildLabel,
    offlineReady,
    checking,
    checkMessage,
    cacheRefreshing,
    checkForUpdate,
    applyUpdate,
    clearCacheAndReload,
    dismissOfflineReady,
  }
}
