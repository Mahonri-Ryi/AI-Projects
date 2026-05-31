import { getBuildId } from './buildInfo'

const VERSION_URL = `${import.meta.env.BASE_URL}version.json`

export interface RemoteVersion {
  buildId: string
  builtAt?: string
}

export async function fetchRemoteVersion(): Promise<RemoteVersion | null> {
  try {
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as RemoteVersion
    if (!data?.buildId) return null
    return data
  } catch {
    return null
  }
}

export function buildIsNewerThanInstalled(localBuildId: string, remoteBuildId: string): boolean {
  if (localBuildId === 'dev' || remoteBuildId === 'dev') return false
  return remoteBuildId !== localBuildId
}

/** True when the server has a newer build than this installed bundle. */
export function isRemoteVersionNewer(remote: RemoteVersion): boolean {
  return buildIsNewerThanInstalled(getBuildId(), remote.buildId)
}

export async function clearAppCaches(): Promise<void> {
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }
}

export async function unregisterServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((r) => r.unregister()))
}

/**
 * Drop cached app shell and service workers, then reload.
 * Does not clear localStorage — sleep logs and settings are preserved.
 */
export async function hardRefreshAppCache(): Promise<void> {
  await clearAppCaches()
  await unregisterServiceWorkers()
  window.location.reload()
}
