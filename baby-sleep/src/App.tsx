import { useState } from 'react'
import { useBabySleep } from './hooks/useBabySleep'
import { useAppActions } from './hooks/useAppActions'
import { useTheme } from './hooks/useTheme'
import { AppShell, type AppTab } from './components/layout/AppShell'
import { ChildrenManager } from './components/ChildrenManager'
import { StatusHero } from './components/StatusHero'
import { DashboardGlance } from './components/DashboardGlance'
import { NextNapCard } from './components/NextNapCard'
import { NextBedtimeCard } from './components/NextBedtimeCard'
import { SleepHintsCard } from './components/SleepHintsCard'
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
import { OnboardingFlow } from './components/OnboardingFlow'
import { WeeklyReportCard } from './components/WeeklyReportCard'
import { DayMarkersCard } from './components/DayMarkersCard'
import { ChildRoutineSettings } from './components/ChildRoutineSettings'
import { BackupExportCard } from './components/BackupExportCard'
import { PrivacyCard } from './components/PrivacyCard'
import { CloudFeaturesCard } from './components/CloudFeaturesCard'
import { ForgotToLogBanner } from './components/ForgotToLogBanner'
import { UndoBanner } from './components/UndoBanner'
import { LoggingStreakChip } from './components/LoggingStreakChip'
import { WindDownChecklistCard } from './components/WindDownChecklistCard'
import { NapTransitionCard } from './components/NapTransitionCard'
import { WakeFeedingPrompt } from './components/WakeFeedingPrompt'
import { AndroidShortcutsCard } from './components/AndroidShortcutsCard'
import { getSources, SOURCES_TOTAL_SLEEP } from './data/researchCatalog'

function App() {
  const [tab, setTab] = useState<AppTab>('home')
  const [settingsAddChild, setSettingsAddChild] = useState(false)
  const [dismissForgotLog, setDismissForgotLog] = useState(false)
  const [showFeedingPrompt, setShowFeedingPrompt] = useState(false)
  const { preference, isDark, setTheme } = useTheme()
  const pwa = usePwaUpdate()

  const {
    state,
    activeChild,
    childSessions,
    childMarkers,
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
    glance,
    sleepHints,
    weeklyReport,
    loggingStreak,
    forgotToLog,
    napTransition,
    checklist,
    travelMode,
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
  } = useBabySleep()

  useAppActions({ startSleep, endSleep })

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

  const finishOnboarding = (name: string, birthDate: string) => {
    if (activeChild) {
      updateChild(activeChild.id, name, birthDate)
    } else {
      addChild(name, birthDate)
    }
    completeOnboarding()
  }

  const handleEndSleep = () => {
    endSleep()
    setShowFeedingPrompt(true)
    setDismissForgotLog(false)
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
          {showOnboarding && (
            <OnboardingFlow
              childName={displayName}
              onComplete={finishOnboarding}
              onSkip={completeOnboarding}
            />
          )}

          {needsProfile && tab === 'home' && !showOnboarding && (
            <div className="banner">
              <p>
                Set birth date for <strong>{displayName}</strong> to unlock nap timing and insights.
              </p>
              <button type="button" className="btn btn--primary" onClick={() => setTab('settings')}>
                Complete profile
              </button>
            </div>
          )}

          {pwa.needRefresh && (
            <UpdateBanner
              onApplyUpdate={pwa.applyUpdate}
              onClearCache={pwa.clearCacheAndReload}
            />
          )}

          {undo && undoSecondsLeft > 0 && (
            <UndoBanner
              label={undo.label}
              secondsLeft={undoSecondsLeft}
              onUndo={undoLastAction}
            />
          )}

          {tab === 'home' && (
            <>
              <DashboardGlance glance={glance} />
              <LoggingStreakChip streak={loggingStreak} />
              {forgotToLog && !dismissForgotLog && !status.isAsleep && (
                <ForgotToLogBanner
                  prompt={forgotToLog}
                  onDismiss={() => setDismissForgotLog(true)}
                />
              )}
              {showFeedingPrompt && !status.isAsleep && (
                <WakeFeedingPrompt
                  onSelect={(tags) => {
                    setLastSessionFeeding(tags)
                    setShowFeedingPrompt(false)
                  }}
                  onSkip={() => setShowFeedingPrompt(false)}
                />
              )}
              <StatusHero
                status={status}
                awakeMinutes={awakeMinutes}
                asleepMinutes={asleepMinutes}
                formatDuration={formatDuration}
              />
              <ActionButtons status={status} onStart={startSleep} onEnd={handleEndSleep} />
              <WindDownChecklistCard
                checklist={checklist}
                onToggle={toggleChecklist}
                onAdd={addChecklist}
                onRemove={removeChecklist}
              />
              <DashboardStats sessions={childSessions} guidance={guidance} now={now} />
              <SleepHintsCard hints={sleepHints} />
              {napTransition && <NapTransitionCard tip={napTransition} />}
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
                travelMode={travelMode}
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
            <>
              <WeeklyReportCard report={weeklyReport} childName={displayName} />
              <DayMarkersCard
                markers={childMarkers}
                onSet={setDayMarker}
                onClear={clearDayMarker}
                now={now}
              />
              <InsightsDashboard sessions={childSessions} guidance={guidance} now={now} />
            </>
          )}

          {tab === 'history' && (
            <SleepLog
              sessions={recentSessions}
              onUpdate={updateSession}
              onDelete={deleteSession}
            />
          )}

          {tab === 'guide' && <SciencePanel guidance={guidance} ageLabel={ageLabel} />}

          {tab === 'settings' && (
            <>
              <AppUpdateCard
                needRefresh={pwa.needRefresh}
                remoteBuildLabel={pwa.remoteBuildLabel}
                checking={pwa.checking}
                cacheRefreshing={pwa.cacheRefreshing}
                checkMessage={pwa.checkMessage}
                onCheck={pwa.checkForUpdate}
                onApplyUpdate={pwa.applyUpdate}
                onClearCache={pwa.clearCacheAndReload}
              />
              <AndroidShortcutsCard glanceHeadline={glance.headline} />
              <BackupExportCard
                state={state}
                activeChild={activeChild}
                childSessions={childSessions}
              />
              <SyncPanel state={state} onImport={replaceState} />
              <ReminderSettings settings={reminders} onChange={setReminders} />
              {activeChild && (
                <ChildRoutineSettings
                  child={activeChild}
                  guidance={guidance}
                  onChange={(routine) => updateChildRoutine(activeChild.id, routine)}
                />
              )}
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
              <ThemeSettings preference={preference} onChange={setTheme} />
              <PrivacyCard />
              <CloudFeaturesCard />
            </>
          )}
        </>
      }
    />
  )
}

export default App
