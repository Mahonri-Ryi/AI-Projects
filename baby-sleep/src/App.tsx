import { useState } from 'react'
import { useBabySleep } from './hooks/useBabySleep'
import { ProfileSetup } from './components/ProfileSetup'
import { StatusHero } from './components/StatusHero'
import { NextNapCard } from './components/NextNapCard'
import { ActionButtons } from './components/ActionButtons'
import { SleepLog } from './components/SleepLog'
import { SciencePanel } from './components/SciencePanel'
import { SyncPanel } from './components/SyncPanel'

type Tab = 'home' | 'log' | 'science' | 'settings'

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const {
    state,
    status,
    prediction,
    guidance,
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
    now,
  } = useBabySleep()

  const needsProfile = !state.profile.birthDate
  const displayName = state.profile.name || 'Baby'

  return (
    <>
      <header className="app-header">
        <h1>Little Dream</h1>
        <p className="subtitle">
          {needsProfile
            ? 'Baby sleep tracker'
            : `${displayName} · ${ageLabel}`}
        </p>
      </header>

      {needsProfile && tab === 'home' && (
        <div className="setup-banner">
          <p>Set birth date in Settings for age-based nap timing.</p>
          <button
            type="button"
            onClick={() => setTab('settings')}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--accent)',
              color: 'white',
              fontWeight: 600,
            }}
          >
            Go to Settings
          </button>
        </div>
      )}

      <nav className="tabs" aria-label="Main">
        <button
          type="button"
          className={tab === 'home' ? 'active' : ''}
          onClick={() => setTab('home')}
        >
          Home
        </button>
        <button
          type="button"
          className={tab === 'log' ? 'active' : ''}
          onClick={() => setTab('log')}
        >
          Log
        </button>
        <button
          type="button"
          className={tab === 'science' ? 'active' : ''}
          onClick={() => setTab('science')}
        >
          Research
        </button>
        <button
          type="button"
          className={tab === 'settings' ? 'active' : ''}
          onClick={() => setTab('settings')}
        >
          Settings
        </button>
      </nav>

      {tab === 'home' && (
        <>
          <StatusHero
            status={status}
            name={displayName}
            awakeMinutes={awakeMinutes}
            asleepMinutes={asleepMinutes}
            formatDuration={formatDuration}
          />
          <NextNapCard
            prediction={prediction}
            guidance={guidance}
            status={status}
            awakeMinutes={awakeMinutes}
            now={now}
          />
          <ActionButtons status={status} onStart={startSleep} onEnd={endSleep} />
          {guidance && !needsProfile && (
            <section className="card" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Today&apos;s guide: {guidance.napCountHint}. Aim for{' '}
              {guidance.totalSleepHours.min}–{guidance.totalSleepHours.max} h sleep per 24 h.
            </section>
          )}
        </>
      )}

      {tab === 'log' && (
        <SleepLog sessions={recentSessions} onDelete={deleteSession} />
      )}

      {tab === 'science' && (
        <SciencePanel guidance={guidance} ageLabel={ageLabel} />
      )}

      {tab === 'settings' && (
        <>
          <ProfileSetup
            name={state.profile.name}
            birthDate={state.profile.birthDate}
            onSave={updateProfile}
          />
          <SyncPanel state={state} onImport={replaceState} />
        </>
      )}
    </>
  )
}

export default App
