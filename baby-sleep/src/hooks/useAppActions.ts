import { useEffect, useRef } from 'react'
import { clearAppActionFromUrl, parseAppAction } from '../lib/appActions'
import type { SleepKind } from '../types'

interface Handlers {
  startSleep: (kind: SleepKind, startIso: string) => void
  endSleep: (endIso: string) => void
}

export function useAppActions(handlers: Handlers) {
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    const action = parseAppAction(window.location.search)
    if (!action) return

    const { startSleep, endSleep } = handlersRef.current
    const now = new Date().toISOString()
    if (action === 'start-nap') startSleep('nap', now)
    if (action === 'start-bed') startSleep('night', now)
    if (action === 'wake') endSleep(now)

    clearAppActionFromUrl()
  }, [])
}
