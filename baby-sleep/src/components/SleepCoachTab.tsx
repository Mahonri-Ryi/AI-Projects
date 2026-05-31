import { useState } from 'react'
import type { ChildProfile, DayMarker, SleepSession, WakeWindowGuidance } from '../types'
import { useSleepCoach } from '../hooks/useSleepCoach'
import { resolveCoachApiBase } from '../lib/sleepCoach/api'
import { detectProviderFromKey } from '../lib/sleepCoach/storage'
import { Card } from './ui/Card'

interface Props {
  activeChild: ChildProfile | null
  childSessions: SleepSession[]
  childMarkers: DayMarker[]
  guidance: WakeWindowGuidance | null
  now: Date
}

export function SleepCoachTab({
  activeChild,
  childSessions,
  childMarkers,
  guidance,
  now,
}: Props) {
  const [input, setInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const coach = useSleepCoach({
    activeChild,
    childSessions,
    childMarkers,
    guidance,
    now,
  })

  const proxyBase = resolveCoachApiBase(coach.settings)
  const hasKey = Boolean(coach.settings.apiKey.trim())
  const keyKind = detectProviderFromKey(coach.settings.apiKey)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || coach.sending) return
    void coach.sendMessage(input)
    setInput('')
  }

  if (!activeChild) {
    return (
      <Card title="Sleep Coach" subtitle="Ask about naps, bedtime, and patterns">
        <p className="prose">Select a child profile to start chatting.</p>
      </Card>
    )
  }

  return (
    <div className="coach-page">
      <Card
        title="Sleep Coach"
        subtitle="Educational guidance — not medical advice"
        action={
          <button
            type="button"
            className="btn btn--ghost btn--compact"
            onClick={() => setShowSettings((v) => !v)}
          >
            {showSettings ? 'Hide setup' : 'Setup'}
          </button>
        }
      >
        <p className="prose coach-intro">
          Bring your own <strong>OpenAI API key</strong> (<code>sk-…</code>). It stays on this device
          only. Cursor dashboard keys (<code>crsr_…</code>) are for coding agents, not this chat — use
          the same OpenAI key you may have in Cursor under Settings → Models.
        </p>

        {showSettings && (
          <div className="coach-settings">
            <label className="form-field">
              <span>API key</span>
              <input
                type="password"
                autoComplete="off"
                placeholder="sk-… (OpenAI, recommended)"
                value={coach.settings.apiKey}
                onChange={(e) => coach.setApiKey(e.target.value)}
              />
            </label>
            <div className="btn-row">
              <button type="button" className="btn btn--ghost btn--compact" onClick={coach.clearApiKey}>
                Clear key
              </button>
              {keyKind === 'cursor' && (
                <button
                  type="button"
                  className="btn btn--ghost btn--compact"
                  onClick={() => void coach.checkCursorKey()}
                >
                  Test Cursor key
                </button>
              )}
            </div>
            {coach.cursorKeyOk && (
              <p className="coach-hint">
                Cursor key: {coach.cursorKeyOk}. Sleep Coach still needs an OpenAI <code>sk-</code> key
                to answer questions.
              </p>
            )}

            <label className="form-field">
              <span>Model</span>
              <input
                type="text"
                value={coach.settings.model}
                onChange={(e) => coach.updateSettings({ model: e.target.value })}
                placeholder="gpt-4o-mini"
              />
            </label>

            <label className="form-field">
              <span>Proxy base URL (production)</span>
              <input
                type="url"
                value={coach.settings.proxyBaseUrl}
                onChange={(e) => coach.updateSettings({ proxyBaseUrl: e.target.value })}
                placeholder="https://your-worker.workers.dev"
              />
            </label>
            <p className="coach-hint">
              {import.meta.env.DEV
                ? 'Dev: using /api/coach proxy automatically.'
                : proxyBase
                  ? `Using proxy: ${proxyBase}`
                  : 'Live app needs a proxy URL (see coach-proxy/README).'}
            </p>

            <label className="form-field reminder-toggle">
              <input
                type="checkbox"
                checked={coach.settings.includeLogContext}
                onChange={(e) => coach.updateSettings({ includeLogContext: e.target.checked })}
              />
              <span>Include recent sleep logs in each answer</span>
            </label>

            <div className="btn-row">
              <button type="button" className="btn btn--ghost btn--compact" onClick={coach.newThread}>
                New chat
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--compact"
                onClick={coach.clearAllThreads}
              >
                Clear history
              </button>
            </div>
          </div>
        )}

        {!hasKey && (
          <p className="coach-hint coach-hint--warn">Open Setup and add an OpenAI API key to ask questions.</p>
        )}
      </Card>

      {coach.threadsForChild.length > 1 && (
        <div className="coach-thread-picker">
          {coach.threadsForChild.map((t) => (
            <button
              key={t.id}
              type="button"
              className={
                coach.activeThread?.id === t.id ? 'coach-thread-pill--active' : 'coach-thread-pill'
              }
              onClick={() => coach.selectThread(t.id)}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}

      <div className="coach-chat" role="log" aria-live="polite">
        {coach.activeThread?.messages.length ? (
          coach.activeThread.messages.map((m) => (
            <div
              key={m.id}
              className={`coach-bubble coach-bubble--${m.role}`}
            >
              <span className="coach-bubble__role">{m.role === 'user' ? 'You' : 'Coach'}</span>
              <p>{m.content}</p>
            </div>
          ))
        ) : (
          <p className="coach-empty">
            Try: “Is a 30-minute third nap normal at 6 months?” or “Bedtime keeps shifting later — what
            should I watch?”
          </p>
        )}
        {coach.sending && <p className="coach-typing">Coach is thinking…</p>}
        {coach.error && <p className="coach-error">{coach.error}</p>}
      </div>

      <form className="coach-compose" onSubmit={onSubmit}>
        <input
          type="text"
          className="coach-compose__input"
          placeholder="Ask about sleep…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!hasKey || coach.sending}
        />
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!hasKey || coach.sending || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  )
}
