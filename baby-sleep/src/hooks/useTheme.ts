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
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(getStoredTheme()))

  const sync = useCallback((pref: ThemePreference) => {
    const next = resolveTheme(pref)
    setResolved(next)
    applyTheme(next)
  }, [])

  useEffect(() => {
    sync(preference)
  }, [preference, sync])

  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => sync('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference, sync])

  const setTheme = useCallback((pref: ThemePreference) => {
    setStoredTheme(pref)
    setPreference(pref)
  }, [])

  return { preference, resolved, setTheme, isDark: resolved === 'dark' }
}
