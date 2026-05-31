import { useCallback, useEffect, useState } from 'react'
import type { ChildProfile, DayMarker, SleepSession, WakeWindowGuidance } from '../types'
import {
  CoachApiError,
  sendCoachChat,
  validateCursorApiKey,
} from '../lib/sleepCoach/api'
import { buildCoachContextBlock, buildCoachSystemPrompt } from '../lib/sleepCoach/context'
import {
  appendMessage,
  createThread,
  detectProviderFromKey,
  loadSleepCoachState,
  saveSleepCoachState,
} from '../lib/sleepCoach/storage'
import type { SleepCoachSettings, SleepCoachState } from '../lib/sleepCoach/types'

interface UseSleepCoachArgs {
  activeChild: ChildProfile | null
  childSessions: SleepSession[]
  childMarkers: DayMarker[]
  guidance: WakeWindowGuidance | null
  now: Date
}

export function useSleepCoach({
  activeChild,
  childSessions,
  childMarkers,
  guidance,
  now,
}: UseSleepCoachArgs) {
  const [state, setState] = useState<SleepCoachState>(loadSleepCoachState)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursorKeyOk, setCursorKeyOk] = useState<string | null>(null)

  useEffect(() => {
    saveSleepCoachState(state)
  }, [state])

  const childId = activeChild?.id ?? ''
  const threadsForChild = state.threads.filter((t) => t.childId === childId)
  const activeThread =
    threadsForChild.find((t) => t.id === state.activeThreadId) ?? threadsForChild[0] ?? null

  const updateSettings = useCallback((patch: Partial<SleepCoachSettings>) => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, ...patch },
    }))
  }, [])

  const setApiKey = useCallback((apiKey: string) => {
    const detected = detectProviderFromKey(apiKey)
    setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        apiKey,
        provider: detected ?? s.settings.provider,
      },
    }))
    setCursorKeyOk(null)
  }, [])

  const clearApiKey = useCallback(() => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, apiKey: '' },
    }))
    setCursorKeyOk(null)
  }, [])

  const checkCursorKey = useCallback(async () => {
    const key = state.settings.apiKey.trim()
    if (!key.startsWith('crsr_')) {
      setCursorKeyOk(null)
      return
    }
    const result = await validateCursorApiKey(key)
    setCursorKeyOk(result.ok ? (result.label ?? 'Valid') : 'Invalid key')
  }, [state.settings.apiKey])

  const selectThread = useCallback((threadId: string) => {
    setState((s) => ({ ...s, activeThreadId: threadId }))
    setError(null)
  }, [])

  const newThread = useCallback(() => {
    if (!childId) return
    const thread = createThread(childId)
    setState((s) => ({
      ...s,
      threads: [thread, ...s.threads],
      activeThreadId: thread.id,
    }))
    setError(null)
  }, [childId])

  const deleteThread = useCallback((threadId: string) => {
    setState((s) => {
      const threads = s.threads.filter((t) => t.id !== threadId)
      const activeThreadId =
        s.activeThreadId === threadId ? (threads.find((t) => t.childId === childId)?.id ?? null) : s.activeThreadId
      return { ...s, threads, activeThreadId }
    })
  }, [childId])

  const clearAllThreads = useCallback(() => {
    setState((s) => ({
      ...s,
      threads: s.threads.filter((t) => t.childId !== childId),
      activeThreadId: null,
    }))
  }, [childId])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeChild || !text.trim()) return

      setSending(true)
      setError(null)

      let thread = activeThread
      if (!thread) {
        thread = createThread(childId)
        setState((s) => ({
          ...s,
          threads: [thread!, ...s.threads],
          activeThreadId: thread!.id,
        }))
      }

      const userText = text.trim()
      let updated = appendMessage(thread, 'user', userText)

      setState((s) => ({
        ...s,
        threads: s.threads.map((t) => (t.id === updated.id ? updated : t)),
      }))

      try {
        const contextBlock =
          state.settings.includeLogContext && activeChild
            ? buildCoachContextBlock(
                activeChild,
                childSessions,
                childMarkers,
                guidance,
                now,
              )
            : undefined

        const { content } = await sendCoachChat({
          settings: state.settings,
          messages: updated.messages.filter((m) => m.role !== 'system'),
          systemPrompt: buildCoachSystemPrompt(),
          contextBlock,
        })

        updated = appendMessage(updated, 'assistant', content)
        setState((s) => ({
          ...s,
          threads: s.threads.map((t) => (t.id === updated.id ? updated : t)),
        }))
      } catch (e) {
        const msg =
          e instanceof CoachApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Something went wrong'
        setError(msg)
      } finally {
        setSending(false)
      }
    },
    [
      activeChild,
      activeThread,
      childId,
      childMarkers,
      childSessions,
      guidance,
      now,
      state.settings,
    ],
  )

  return {
    settings: state.settings,
    threadsForChild,
    activeThread,
    sending,
    error,
    cursorKeyOk,
    updateSettings,
    setApiKey,
    clearApiKey,
    checkCursorKey,
    selectThread,
    newThread,
    deleteThread,
    clearAllThreads,
    sendMessage,
  }
}
