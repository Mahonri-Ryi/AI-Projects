import { useState } from 'react'
import { useBabySleep } from './hooks/useBabySleep'
import { AppShell, type AppTab } from './components/layout/AppShell'
import { ProfileSetup } from './components/ProfileSetup'
import { StatusHero } from './components/StatusHero'
import { NextNapCard } from './components/NextNapCard'
import { ActionButtons } from './components/ActionButtons'
import { SleepLog } from './components/SleepLog'
import { SciencePanel } from './components/SciencePanel'
import { SyncPanel } from './components/SyncPanel'
import { InsightsDashboard } from './components/insights/InsightsDashboard'
import { DashboardStats } from './components/DashboardStats'

function App() {
  const [tab, setTab] = useState<AppTab>('home')
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
    allSessions,
    now,
  } = useBabySleep()

  const needsProfile = !state.profile.birthDate
  const displayName = state.profile.name || 'Baby'

  const statusPill = status.isAsleep
    ? { label: 'Sleeping', variant: 'asleep' as const }
    : { label: 'Awake', variant: 'awake' as const }

  return (
    <AppShell
      tab={tab}
      onTabChange={setTab}
      childName={displayName}
      ageLabel={ageLabel}
      statusPill={needsProfile ? undefined : statusPill}
    >
      {needsProfile && tab === 'home' && (
        <div className="banner">
          <p>Complete your child profile to unlock personalized nap timing and analytics.</p>
          <button type="button" className="btn btn--primary" onClick={() => setTab('settings')}>
            Set up profile
          </button>
        </div>
      )}

      {tab === 'home' && (
        <>
          <StatusHero
            status={status}
            awakeMinutes={awakeMinutes}
            asleepMinutes={asleepMinutes}
            formatDuration={formatDuration}
          />
          <DashboardStats sessions={allSessions} guidance={guidance} now={now} />
          <NextNapCard
            prediction={prediction}
            guidance={guidance}
            status={status}
            awakeMinutes={awakeMinutes}
            now={now}
          />
          <ActionButtons status={status} onStart={startSleep} onEnd={endSleep} />
          {guidance && !needsProfile && (
            <p className="guide-chip" style={{ width: '100%', textAlign: 'center' }}>
              Daily target: {guidance.totalSleepHours.min}–{guidance.totalSleepHours.max}h ·{' '}
              {guidance.napCountHint}
            </p>
          )}
        </>
      )}

      {tab === 'insights' && (
        <InsightsDashboard sessions={allSessions} guidance={guidance} now={now} />
      )}

      {tab === 'history' && (
        <SleepLog sessions={recentSessions} onDelete={deleteSession} />
      )}

      {tab === 'guide' && <SciencePanel guidance={guidance} ageLabel={ageLabel} />}

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
    </AppShell>
  )
}

export default App
