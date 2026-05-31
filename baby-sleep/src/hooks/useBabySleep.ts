import { useCallback, useEffect, useMemo, useState } from 'react'
import { getWakeWindowGuidance, getAgeInMonths, formatAge } from '../data/sleepScience'
import {
  getSleepStatus,
  predictNextNap,
  predictNextBedtime,
  eveningBedtimeLoggedToday,
  generateId,
  formatDuration,
  DEFAULT_REMINDER_SETTINGS,
} from '../lib/sleepLogic'
import { parseISO } from 'date-fns'
import { useSleepReminders } from './useSleepReminders'
import { createDefaultChild, normalizeState, pickChildColor } from '../lib/migrate'
import { loadStateWithLegacy, saveState } from '../lib/storage'
import { decodeSyncFromUrl, mergeAppState } from '../lib/sync'
import type { AppState, ChildProfile, ReminderSettings, SleepKind } from '../types'

function loadInitialState(): AppState {
  const base = loadStateWithLegacy()
  const incoming = decodeSyncFromUrl(window.location.search)
  if (!incoming) return base
  const url = new URL(window.location.href)
  url.searchParams.delete('sync')
  window.history.replaceState({}, '', url.pathname + url.hash)
  return mergeAppState(base, incoming)
}

export function useBabySleep() {
  const [state, setState] = useState<AppState>(loadInitialState)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  // tick forces periodic refresh of timers and predictions
  const now = useMemo(() => new Date(), [tick]) // eslint-disable-line react-hooks/exhaustive-deps -- tick is intentional clock

  const activeChild = useMemo(
    () => state.children.find((c) => c.id === state.activeChildId) ?? null,
    [state.children, state.activeChildId],
  )

  const childSessions = useMemo(
    () => state.sessions.filter((s) => s.childId === state.activeChildId),
    [state.sessions, state.activeChildId],
  )

  const status = useMemo(() => getSleepStatus(childSessions), [childSessions])

  const prediction = useMemo(
    () =>
      activeChild?.birthDate
        ? predictNextNap(activeChild.birthDate, childSessions, now)
        : null,
    [activeChild, childSessions, now],
  )

  const bedtimePrediction = useMemo(
    () =>
      activeChild?.birthDate
        ? predictNextBedtime(activeChild.birthDate, childSessions, now)
        : null,
    [activeChild, childSessions, now],
  )

  const nightStartedToday = useMemo(
    () => eveningBedtimeLoggedToday(childSessions, now),
    [childSessions, now],
  )

  const reminders: ReminderSettings = state.reminders ?? { ...DEFAULT_REMINDER_SETTINGS }

  useSleepReminders(
    activeChild?.name ?? 'Baby',
    prediction,
    bedtimePrediction,
    reminders,
    now,
  )

  const guidance = useMemo(
    () =>
      activeChild?.birthDate
        ? getWakeWindowGuidance(activeChild.birthDate, now)
        : null,
    [activeChild, now],
  )

  const ageMonths = activeChild?.birthDate
    ? getAgeInMonths(activeChild.birthDate, now)
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

  const setActiveChild = useCallback((childId: string) => {
    setState((s) => ({ ...s, activeChildId: childId }))
  }, [])

  const addChild = useCallback((name: string, birthDate: string) => {
    setState((s) => {
      const child: ChildProfile = {
        id: generateId(),
        name: name.trim() || 'Baby',
        birthDate,
        color: pickChildColor(s.children.length),
      }
      return {
        ...s,
        children: [...s.children, child],
        activeChildId: child.id,
      }
    })
  }, [])

  const updateChild = useCallback((childId: string, name: string, birthDate: string) => {
    setState((s) => ({
      ...s,
      children: s.children.map((c) =>
        c.id === childId ? { ...c, name: name.trim() || c.name, birthDate } : c,
      ),
    }))
  }, [])

  const removeChild = useCallback((childId: string) => {
    setState((s) => {
      const children = s.children.filter((c) => c.id !== childId)
      if (children.length === 0) {
        const fresh = createDefaultChild()
        return {
          ...s,
          children: [fresh],
          activeChildId: fresh.id,
          sessions: s.sessions.filter((x) => x.childId !== childId),
        }
      }
      const activeChildId =
        s.activeChildId === childId ? children[0].id : s.activeChildId
      return {
        ...s,
        children,
        activeChildId,
        sessions: s.sessions.filter((x) => x.childId !== childId),
      }
    })
  }, [])

  const startSleep = useCallback(
    (kind: SleepKind) => {
      setState((s) => {
        const open = s.sessions.find(
          (x) => x.childId === s.activeChildId && x.end === null,
        )
        if (open) return s
        return {
          ...s,
          sessions: [
            ...s.sessions,
            {
              id: generateId(),
              childId: s.activeChildId,
              kind,
              start: new Date().toISOString(),
              end: null,
            },
          ],
        }
      })
    },
    [],
  )

  const endSleep = useCallback(() => {
    setState((s) => {
      const open = s.sessions.find(
        (x) => x.childId === s.activeChildId && x.end === null,
      )
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
    setState(normalizeState(next))
  }, [])

  const recentSessions = useMemo(() => {
    return [...childSessions]
      .sort((a, b) => parseISO(b.start).getTime() - parseISO(a.start).getTime())
      .slice(0, 30)
  }, [childSessions])

  const needsProfile = !activeChild?.birthDate

  const setReminders = useCallback((next: ReminderSettings) => {
    setState((s) => ({ ...s, reminders: next }))
  }, [])

  return {
    state,
    activeChild,
    childSessions,
    status,
    prediction,
    bedtimePrediction,
    nightStartedToday,
    reminders,
    setReminders,
    guidance,
    ageMonths,
    ageLabel,
    awakeMinutes,
    asleepMinutes,
    formatDuration,
    setActiveChild,
    addChild,
    updateChild,
    removeChild,
    startSleep,
    endSleep,
    deleteSession,
    replaceState,
    recentSessions,
    needsProfile,
    now,
  }
}
