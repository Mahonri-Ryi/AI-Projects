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
import { getGlanceSummary } from '../lib/glance'
import { generateSleepHints } from '../lib/sleepHints'
import { buildWeeklyReport } from '../lib/weeklyReport'
import { upsertDayMarker, removeDayMarker, markersForChild } from '../lib/dayMarkers'
import { getLoggingStreak } from '../lib/streaks'
import { getForgotToLogPrompt } from '../lib/forgotToLog'
import { getNapTransitionTips } from '../lib/napTransitions'
import { isTravelDay } from '../lib/travelMode'
import { cloneSessions } from '../lib/travelMode'
import {
  addChecklistItem,
  normalizeChecklist,
  removeChecklistItem,
  toggleChecklistItem,
} from '../lib/checklist'
import type {
  AppState,
  ChildProfile,
  ChildRoutine,
  DayMarkerTag,
  FeedingTag,
  ReminderSettings,
  SleepKind,
  SleepSession,
  UndoOffer,
} from '../types'

const UNDO_MS = 30_000

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
  const [undo, setUndo] = useState<UndoOffer | null>(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!undo) return
    const remaining = undo.expiresAt - Date.now()
    if (remaining <= 0) {
      const clear = window.setTimeout(() => setUndo(null), 0)
      return () => window.clearTimeout(clear)
    }
    const t = window.setTimeout(() => setUndo(null), remaining)
    return () => window.clearTimeout(t)
  }, [undo])

  const now = useMemo(() => new Date(), [tick]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeChild = useMemo(
    () => state.children.find((c) => c.id === state.activeChildId) ?? null,
    [state.children, state.activeChildId],
  )

  const childSessions = useMemo(
    () => state.sessions.filter((s) => s.childId === state.activeChildId),
    [state.sessions, state.activeChildId],
  )

  const childMarkers = useMemo(
    () => markersForChild(state, state.activeChildId),
    [state, state.activeChildId],
  )

  const travelMode = useMemo(
    () => isTravelDay(childMarkers, state.activeChildId, now),
    [childMarkers, state.activeChildId, now],
  )

  const status = useMemo(() => getSleepStatus(childSessions), [childSessions])

  const routine = activeChild?.routine

  const prediction = useMemo(
    () =>
      activeChild?.birthDate
        ? predictNextNap(activeChild.birthDate, childSessions, now, routine)
        : null,
    [activeChild, childSessions, now, routine],
  )

  const bedtimePrediction = useMemo(
    () =>
      activeChild?.birthDate
        ? predictNextBedtime(activeChild.birthDate, childSessions, now, routine, travelMode)
        : null,
    [activeChild, childSessions, now, routine, travelMode],
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

  const needsProfile = !activeChild?.birthDate

  const showOnboarding = !state.onboardingComplete

  const glance = useMemo(
    () => getGlanceSummary(status, prediction, bedtimePrediction, needsProfile, now),
    [status, prediction, bedtimePrediction, needsProfile, now],
  )

  const sleepHints = useMemo(
    () => generateSleepHints(childSessions, guidance, now),
    [childSessions, guidance, now],
  )

  const weeklyReport = useMemo(
    () => buildWeeklyReport(childSessions, now),
    [childSessions, now],
  )

  const loggingStreak = useMemo(
    () => getLoggingStreak(childSessions, now),
    [childSessions, now],
  )

  const forgotToLog = useMemo(() => {
    const maxWake = guidance?.maxMinutes ?? 120
    return getForgotToLogPrompt(childSessions, maxWake + 30, now)
  }, [childSessions, guidance, now])

  const napTransition = useMemo(
    () => (activeChild?.birthDate ? getNapTransitionTips(activeChild.birthDate, now) : null),
    [activeChild, now],
  )

  const checklist = useMemo(
    () => normalizeChecklist(state.checklist, now),
    [state.checklist, now],
  )

  const offerUndo = useCallback((sessions: SleepSession[], label: string) => {
    setUndo({
      label,
      expiresAt: Date.now() + UNDO_MS,
      sessionsSnapshot: cloneSessions(sessions),
    })
  }, [])

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
        routine: {},
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

  const updateChildRoutine = useCallback((childId: string, routine: ChildRoutine) => {
    setState((s) => ({
      ...s,
      children: s.children.map((c) =>
        c.id === childId ? { ...c, routine: { ...c.routine, ...routine } } : c,
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
          dayMarkers: (s.dayMarkers ?? []).filter((m) => m.childId !== childId),
        }
      }
      const activeChildId =
        s.activeChildId === childId ? children[0].id : s.activeChildId
      return {
        ...s,
        children,
        activeChildId,
        sessions: s.sessions.filter((x) => x.childId !== childId),
        dayMarkers: (s.dayMarkers ?? []).filter((m) => m.childId !== childId),
      }
    })
  }, [])

  const startSleep = useCallback(
    (kind: SleepKind) => {
      setState((s) => {
        const open = s.sessions.find((x) => x.childId === s.activeChildId && x.end === null)
        if (open) return s
        offerUndo(s.sessions, kind === 'nap' ? 'Started nap' : 'Started bedtime')
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
    [offerUndo],
  )

  const endSleep = useCallback(() => {
    setState((s) => {
      const open = s.sessions.find((x) => x.childId === s.activeChildId && x.end === null)
      if (!open) return s
      offerUndo(s.sessions, 'Wake up')
      const end = new Date().toISOString()
      return {
        ...s,
        sessions: s.sessions.map((x) => (x.id === open.id ? { ...x, end } : x)),
      }
    })
  }, [offerUndo])

  const setLastSessionFeeding = useCallback((tags: FeedingTag[]) => {
    setState((s) => {
      const sorted = [...s.sessions]
        .filter((x) => x.childId === s.activeChildId && x.end)
        .sort((a, b) => parseISO(b.end!).getTime() - parseISO(a.end!).getTime())
      const last = sorted[0]
      if (!last) return s
      return {
        ...s,
        sessions: s.sessions.map((x) =>
          x.id === last.id ? { ...x, feedingTags: tags.length ? tags : undefined } : x,
        ),
      }
    })
  }, [])

  const addSession = useCallback(
    (patch: Omit<SleepSession, 'id' | 'childId'>): boolean => {
      let added = false
      setState((s) => {
        if (patch.end === null) {
          const open = s.sessions.find((x) => x.childId === s.activeChildId && x.end === null)
          if (open) return s
        }
        if (patch.end && parseISO(patch.end).getTime() <= parseISO(patch.start).getTime()) {
          return s
        }
        added = true
        offerUndo(s.sessions, 'Added session')
        return {
          ...s,
          sessions: [
            ...s.sessions,
            {
              id: generateId(),
              childId: s.activeChildId,
              ...patch,
            },
          ],
        }
      })
      return added
    },
    [offerUndo],
  )

  const updateSession = useCallback(
    (
      id: string,
      patch: Partial<Pick<SleepSession, 'kind' | 'start' | 'end' | 'feedingTags'>>,
    ) => {
      setState((s) => ({
        ...s,
        sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }))
    },
    [],
  )

  const deleteSession = useCallback(
    (id: string) => {
      setState((s) => {
        offerUndo(s.sessions, 'Removed session')
        return {
          ...s,
          sessions: s.sessions.filter((x) => x.id !== id),
        }
      })
    },
    [offerUndo],
  )

  const setDayMarker = useCallback(
    (date: string, tag: DayMarkerTag, note?: string) => {
      setState((s) => upsertDayMarker(s, s.activeChildId, date, tag, note))
    },
    [],
  )

  const clearDayMarker = useCallback((markerId: string) => {
    setState((s) => removeDayMarker(s, markerId))
  }, [])

  const completeOnboarding = useCallback(() => {
    setState((s) => ({ ...s, onboardingComplete: true }))
  }, [])

  const replaceState = useCallback((next: AppState) => {
    setState(
      normalizeState({
        ...next,
        syncMeta: {
          lastSyncedAt: new Date().toISOString(),
          lastSyncLabel: 'Imported backup',
          mergeCount: next.syncMeta?.mergeCount ?? 0,
        },
      }),
    )
  }, [])

  const undoLastAction = useCallback(() => {
    if (!undo || Date.now() > undo.expiresAt) return
    setState((s) => ({ ...s, sessions: cloneSessions(undo.sessionsSnapshot) }))
    setUndo(null)
  }, [undo])

  const toggleChecklist = useCallback(
    (itemId: string) => {
      setState((s) => toggleChecklistItem(s, itemId, now))
    },
    [now],
  )

  const addChecklist = useCallback(
    (kind: 'nap' | 'bed', label: string) => {
      setState((s) => addChecklistItem(s, kind, label, now))
    },
    [now],
  )

  const removeChecklist = useCallback(
    (itemId: string) => {
      setState((s) => removeChecklistItem(s, itemId, now))
    },
    [now],
  )

  const recentSessions = useMemo(() => {
    return [...childSessions]
      .sort((a, b) => parseISO(b.start).getTime() - parseISO(a.start).getTime())
      .slice(0, 50)
  }, [childSessions])

  const setReminders = useCallback((next: ReminderSettings) => {
    setState((s) => ({ ...s, reminders: next }))
  }, [])

  const undoSecondsLeft = undo
    ? Math.max(0, Math.ceil((undo.expiresAt - now.getTime()) / 1000))
    : 0

  return {
    state,
    activeChild,
    childSessions,
    childMarkers,
    travelMode,
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
    glance,
    sleepHints,
    weeklyReport,
    loggingStreak,
    forgotToLog,
    napTransition,
    checklist,
    showOnboarding,
    undo,
    undoSecondsLeft,
    undoLastAction,
    setActiveChild,
    addChild,
    updateChild,
    updateChildRoutine,
    removeChild,
    startSleep,
    endSleep,
    setLastSessionFeeding,
    addSession,
    updateSession,
    deleteSession,
    setDayMarker,
    clearDayMarker,
    completeOnboarding,
    replaceState,
    toggleChecklist,
    addChecklist,
    removeChecklist,
    recentSessions,
    needsProfile,
    now,
  }
}
