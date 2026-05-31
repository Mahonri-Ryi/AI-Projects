import { useCallback, useEffect, useState } from 'react'
import {
  applyTheme,
  getStoredTheme,
  resolveTheme,
  setStoredTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '../lib/theme'

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => getStoredTheme())
  const [resolved, setResolved] = useState<ResolvedTheme>(() => {
    const pref = getStoredTheme()
    const next = resolveTheme(pref)
    applyTheme(next)
    return next
  })

  const applyPreference = useCallback((pref: ThemePreference) => {
    const next = resolveTheme(pref)
    setResolved(next)
    applyTheme(next)
  }, [])

  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyPreference('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference, applyPreference])

  const setTheme = useCallback(
    (pref: ThemePreference) => {
      setStoredTheme(pref)
      setPreference(pref)
      applyPreference(pref)
    },
    [applyPreference],
  )

  return { preference, resolved, setTheme, isDark: resolved === 'dark' }
}
