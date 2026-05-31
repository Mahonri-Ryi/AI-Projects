import { useEffect, useRef } from 'react'
import type { NextBedtimePrediction, NextNapPrediction, ReminderSettings } from '../types'
import {
  buildDueReminders,
  remindersToFire,
  showSleepReminder,
} from '../lib/reminders'

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

  useEffect(() => {
    if (!settings.enabled) return

    const due = buildDueReminders(childName, nap, bedtime, settings, now)
    const toFire = remindersToFire(due, now, firedRef.current)

    for (const r of toFire) {
      const key = `${r.kind}-${r.fireAt.getTime()}`
      firedRef.current.add(key)
      showSleepReminder(r.title, r.body, `little-dream-${r.kind}`)
    }
  }, [childName, nap, bedtime, settings, now])
}
