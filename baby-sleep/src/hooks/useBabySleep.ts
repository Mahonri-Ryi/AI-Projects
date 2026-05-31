import { useCallback, useEffect, useMemo, useState } from 'react'
import { parseISO } from 'date-fns'
import { getWakeWindowGuidance, getAgeInMonths, formatAge } from '../data/sleepScience'
import {
  getSleepStatus,
  predictNextNap,
  generateId,
  formatDuration,
} from '../lib/sleepLogic'
import { loadState, saveState } from '../lib/storage'
import { decodeSyncFromUrl, mergeSessions } from '../lib/sync'
import type { AppState, SleepKind } from '../types'

export function useBabySleep() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [tick, setTick] = useState(0)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const payload = decodeSyncFromUrl(window.location.search)
    if (!payload) return
    setState((prev) => ({
      ...prev,
      profile: payload.profile.birthDate ? payload.profile : prev.profile,
      sessions: mergeSessions(prev.sessions, payload.sessions),
    }))
    const url = new URL(window.location.href)
    url.searchParams.delete('sync')
    window.history.replaceState({}, '', url.pathname + url.hash)
  }, [])

  const now = useMemo(() => new Date(), [tick])

  const status = useMemo(() => getSleepStatus(state.sessions, now), [state.sessions, now])
  const prediction = useMemo(
    () =>
      state.profile.birthDate
        ? predictNextNap(state.profile.birthDate, state.sessions, now)
        : null,
    [state.profile.birthDate, state.sessions, now],
  )

  const guidance = useMemo(
    () =>
      state.profile.birthDate
        ? getWakeWindowGuidance(state.profile.birthDate, now)
        : null,
    [state.profile.birthDate, now],
  )

  const ageMonths = state.profile.birthDate
    ? getAgeInMonths(state.profile.birthDate, now)
    : null
  const ageLabel = ageMonths !== null ? formatAge(ageMonths) : null

  const awakeMinutes = useMemo(() => {
    if (!status.awakeSince) return 0
    return Math.floor((now.getTime() - status.awakeSince.getTime()) / 60_000)
  }, [status.awakeSince, now])

  const asleepMinutes = useMemo(() => {
    if (!status.asleepSince) return 0
    return Math.floor((now.getTime() - status.asleepSince.getTime()) / 60_000)
  }, [status.asleepSince, now])

  const updateProfile = useCallback((name: string, birthDate: string) => {
    setState((s) => ({ ...s, profile: { name, birthDate } }))
  }, [])

  const startSleep = useCallback((kind: SleepKind) => {
    setState((s) => {
      const open = s.sessions.find((x) => x.end === null)
      if (open) return s
      return {
        ...s,
        sessions: [
          ...s.sessions,
          { id: generateId(), kind, start: new Date().toISOString(), end: null },
        ],
      }
    })
  }, [])

  const endSleep = useCallback(() => {
    setState((s) => {
      const open = s.sessions.find((x) => x.end === null)
      if (!open) return s
      const end = new Date().toISOString()
      return {
        ...s,
        sessions: s.sessions.map((x) => (x.id === open.id ? { ...x, end } : x)),
      }
    })
  }, [])

  const deleteSession = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      sessions: s.sessions.filter((x) => x.id !== id),
    }))
  }, [])

  const replaceState = useCallback((next: AppState) => {
    setState(next)
  }, [])

  const recentSessions = useMemo(() => {
    return [...state.sessions]
      .sort((a, b) => parseISO(b.start).getTime() - parseISO(a.start).getTime())
      .slice(0, 30)
  }, [state.sessions])

  const allSessions = state.sessions

  return {
    state,
    status,
    prediction,
    guidance,
    ageMonths,
    ageLabel,
    awakeMinutes,
    asleepMinutes,
    formatDuration,
    updateProfile,
    startSleep,
    endSleep,
    deleteSession,
    replaceState,
    recentSessions,
    allSessions,
    now,
  }
}
