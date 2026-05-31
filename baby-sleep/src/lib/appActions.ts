export type AppAction = 'start-nap' | 'start-bed' | 'wake'

export function parseAppAction(search: string): AppAction | null {
  const action = new URLSearchParams(search).get('action')
  if (action === 'start-nap' || action === 'nap') return 'start-nap'
  if (action === 'start-bed' || action === 'bed' || action === 'bedtime') return 'start-bed'
  if (action === 'wake' || action === 'wake-up') return 'wake'
  return null
}

export function clearAppActionFromUrl(): void {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('action')) return
  url.searchParams.delete('action')
  window.history.replaceState({}, '', url.pathname + url.search + url.hash)
}
