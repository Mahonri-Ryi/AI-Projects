import { useEffect, useRef } from 'react'
import type { NextBedtimePrediction, NextNapPrediction, ReminderSettings } from '../types'
import {
  buildDueReminders,
  clearServiceWorkerReminders,
  remindersToFire,
  showSleepReminder,
  syncRemindersToServiceWorker,
} from '../lib/reminders'
import { getNotificationPermission } from '../lib/notificationPermission'

export function useSleepReminders(
  childName: string,
  nap: NextNapPrediction | null,
  bedtime: NextBedtimePrediction | null,
  settings: ReminderSettings,
  now: Date,
) {
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    firedRef.current.clear()
  }, [childName, settings.enabled, settings.napMinutesBefore, settings.bedtimeMinutesBefore])

  const due = buildDueReminders(childName, nap, bedtime, settings, now)

  useEffect(() => {
    if (!settings.enabled || getNotificationPermission() !== 'granted') {
      void clearServiceWorkerReminders()
      return
    }
    void syncRemindersToServiceWorker(due)
  }, [due, settings.enabled])

  useEffect(() => {
    if (!settings.enabled || getNotificationPermission() !== 'granted') return

    const toFire = remindersToFire(due, now, firedRef.current)

    for (const r of toFire) {
      const key = `${r.kind}-${r.fireAt.getTime()}`
      firedRef.current.add(key)
      void showSleepReminder(r.title, r.body, r.tag)
    }
  }, [due, settings.enabled, now])
}
