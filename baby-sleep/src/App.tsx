import { useState } from 'react'
import { useBabySleep } from './hooks/useBabySleep'
import { useTheme } from './hooks/useTheme'
import { AppShell, type AppTab } from './components/layout/AppShell'
import { ChildrenManager } from './components/ChildrenManager'
import { StatusHero } from './components/StatusHero'
import { NextNapCard } from './components/NextNapCard'
import { NextBedtimeCard } from './components/NextBedtimeCard'
import { ReminderSettings } from './components/ReminderSettings'
import { AppUpdateCard } from './components/AppUpdateCard'
import { UpdateBanner } from './components/UpdateBanner'
import { usePwaUpdate } from './hooks/usePwaUpdate'
import { ActionButtons } from './components/ActionButtons'
import { SleepLog } from './components/SleepLog'
import { SciencePanel } from './components/SciencePanel'
import { SyncPanel } from './components/SyncPanel'
import { InsightsDashboard } from './components/insights/InsightsDashboard'
import { DashboardStats } from './components/DashboardStats'
import { ResearchLinks } from './components/ui/ResearchLinks'
import { ThemeSettings } from './components/ThemeSettings'
import { getSources, SOURCES_TOTAL_SLEEP } from './data/researchCatalog'

function App() {
  const [tab, setTab] = useState<AppTab>('home')
  const [settingsAddChild, setSettingsAddChild] = useState(false)
  const { preference, isDark, setTheme } = useTheme()
  const pwa = usePwaUpdate()

  const {
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
  } = useBabySleep()

  const displayName = activeChild?.name || 'Baby'

  const statusPill = status.isAsleep
    ? { label: 'Sleeping', variant: 'asleep' as const }
    : { label: 'Awake', variant: 'awake' as const }

  const goAddChild = () => {
    setTab('settings')
    setSettingsAddChild(true)
  }

  const quickToggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <AppShell
      tab={tab}
      onTabChange={setTab}
      children={state.children}
      activeChildId={state.activeChildId}
      onSelectChild={setActiveChild}
      onAddChild={goAddChild}
      ageLabel={ageLabel}
      statusPill={needsProfile ? undefined : statusPill}
      isDark={isDark}
      onThemeQuickToggle={quickToggleTheme}
      contentChildren={
        <>
          {needsProfile && tab === 'home' && (
            <div className="banner">
              <p>
                Set birth date for <strong>{displayName}</strong> to unlock nap timing and insights.
              </p>
              <button type="button" className="btn btn--primary" onClick={() => setTab('settings')}>
                Complete profile
              </button>
            </div>
          )}

          {pwa.needRefresh && <UpdateBanner onApplyUpdate={pwa.applyUpdate} />}

          {tab === 'home' && (
            <>
              <StatusHero
                status={status}
                awakeMinutes={awakeMinutes}
                asleepMinutes={asleepMinutes}
                formatDuration={formatDuration}
              />
              <ActionButtons status={status} onStart={startSleep} onEnd={endSleep} />
              <DashboardStats sessions={childSessions} guidance={guidance} now={now} />
              <NextNapCard
                prediction={prediction}
                guidance={guidance}
                status={status}
                awakeMinutes={awakeMinutes}
                now={now}
              />
              <NextBedtimeCard
                prediction={bedtimePrediction}
                status={status}
                now={now}
                nightStartedToday={nightStartedToday}
              />
              {guidance && !needsProfile && (
                <div className="guide-chip" style={{ width: '100%' }}>
                  <p style={{ margin: 0, textAlign: 'center' }}>
                    Daily target: {guidance.totalSleepHours.min}–{guidance.totalSleepHours.max}h ·{' '}
                    {guidance.napCountHint}
                  </p>
                  <ResearchLinks sources={getSources(SOURCES_TOTAL_SLEEP)} compact />
                </div>
              )}
            </>
          )}

          {tab === 'insights' && (
            <InsightsDashboard sessions={childSessions} guidance={guidance} now={now} />
          )}

          {tab === 'history' && (
            <SleepLog sessions={recentSessions} onDelete={deleteSession} />
          )}

          {tab === 'guide' && <SciencePanel guidance={guidance} ageLabel={ageLabel} />}

          {tab === 'settings' && (
            <>
              <AppUpdateCard
                needRefresh={pwa.needRefresh}
                checking={pwa.checking}
                checkMessage={pwa.checkMessage}
                onCheck={pwa.checkForUpdate}
                onApplyUpdate={pwa.applyUpdate}
              />
              <ThemeSettings preference={preference} onChange={setTheme} />
              <ReminderSettings settings={reminders} onChange={setReminders} />
              <ChildrenManager
                children={state.children}
                activeChildId={state.activeChildId}
                onAdd={(name, birth) => {
                  addChild(name, birth)
                  setSettingsAddChild(false)
                }}
                onUpdate={updateChild}
                onRemove={removeChild}
                onSelect={setActiveChild}
                startAdding={settingsAddChild}
              />
              <SyncPanel state={state} onImport={replaceState} />
            </>
          )}
        </>
      }
    />
  )
}

export default App
