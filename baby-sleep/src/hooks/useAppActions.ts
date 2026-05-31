import { useEffect, useRef } from 'react'
import { clearAppActionFromUrl, parseAppAction } from '../lib/appActions'
import type { SleepKind } from '../types'

interface Handlers {
  startSleep: (kind: SleepKind) => void
  endSleep: () => void
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
    if (action === 'start-nap') startSleep('nap')
    if (action === 'start-bed') startSleep('night')
    if (action === 'wake') endSleep()

    clearAppActionFromUrl()
  }, [])
}
