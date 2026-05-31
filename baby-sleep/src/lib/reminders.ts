import { subMinutes } from 'date-fns'
import type { NextBedtimePrediction, NextNapPrediction, ReminderSettings } from '../types'
import { formatDurationWords } from './timeDisplay'
import {
  getNotificationPermission,
  notificationsSupported,
  serviceWorkerSupported,
} from './notificationPermission'

export {
  getNotificationPermission,
  getPermissionUiState,
  isInstalledAsPwa,
  notificationsSupported,
  permissionStatusLabel,
  requestPhoneNotificationPermission,
  serviceWorkerSupported,
} from './notificationPermission'

export type ReminderKind = 'nap' | 'bedtime'

export interface DueReminder {
  kind: ReminderKind
  fireAt: Date
  title: string
  body: string
  tag: string
}

export function buildDueReminders(
  childName: string,
  nap: NextNapPrediction | null,
  bedtime: NextBedtimePrediction | null,
  settings: ReminderSettings,
  now = new Date(),
): DueReminder[] {
  if (!settings.enabled) return []

  const name = childName.trim() || 'Baby'
  const due: DueReminder[] = []

  if (nap) {
    const fireAt = subMinutes(nap.sweetSpot, settings.napMinutesBefore)
    if (fireAt > now) {
      due.push({
        kind: 'nap',
        fireAt,
        title: `${name}: Nap wind-down soon`,
        body: `Start calming for nap in about ${formatDurationWords(settings.napMinutesBefore)} — watch sleepy cues.`,
        tag: 'little-dream-nap',
      })
    }
  }

  if (bedtime) {
    const fireAt = subMinutes(bedtime.sweetSpot, settings.bedtimeMinutesBefore)
    if (fireAt > now) {
      due.push({
        kind: 'bedtime',
        fireAt,
        title: `${name}: Bedtime wind-down soon`,
        body: `Begin evening routine in about ${formatDurationWords(settings.bedtimeMinutesBefore)}.`,
        tag: 'little-dream-bedtime',
      })
    }
  }

  return due
}

/** Show via service worker (required for iOS PWA). Falls back to page Notification API. */
export async function showSleepReminder(title: string, body: string, tag: string): Promise<void> {
  if (!notificationsSupported() || getNotificationPermission() !== 'granted') return

  const icon = `${import.meta.env.BASE_URL}favicon.svg`
  const options: NotificationOptions = { body, tag, icon }

  if (serviceWorkerSupported()) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, options)
      return
    } catch {
      // fall through
    }
  }

  try {
    new Notification(title, options)
  } catch {
    // blocked on some platforms when not using SW
  }
}

/** Push upcoming reminders to the service worker for background alerts. */
export async function syncRemindersToServiceWorker(reminders: DueReminder[]): Promise<void> {
  if (!serviceWorkerSupported() || getNotificationPermission() !== 'granted') return

  try {
    const registration = await navigator.serviceWorker.ready
    const openUrl = new URL(import.meta.env.BASE_URL, window.location.origin).href
    registration.active?.postMessage({
      type: 'SCHEDULE_REMINDERS',
      reminders: reminders.map((r) => ({
        fireAt: r.fireAt.getTime(),
        title: r.title,
        body: r.body,
        tag: r.tag,
      })),
      icon: `${import.meta.env.BASE_URL}favicon.svg`,
      openUrl,
    })
  } catch {
    // SW not ready
  }
}

export async function clearServiceWorkerReminders(): Promise<void> {
  if (!serviceWorkerSupported()) return
  try {
    const registration = await navigator.serviceWorker.ready
    registration.active?.postMessage({ type: 'SCHEDULE_REMINDERS', reminders: [] })
  } catch {
    // ignore
  }
}

/** Fire if we're within one minute after the scheduled reminder time. */
export function remindersToFire(
  due: DueReminder[],
  now: Date,
  alreadyFired: Set<string>,
): DueReminder[] {
  return due.filter((r) => {
    const key = `${r.kind}-${r.fireAt.getTime()}`
    if (alreadyFired.has(key)) return false
    const delta = now.getTime() - r.fireAt.getTime()
    return delta >= 0 && delta < 60_000
  })
}

export function reminderLeadOptions(): { nap: number[]; bedtime: number[] } {
  return {
    nap: [5, 10, 15, 20],
    bedtime: [10, 15, 20, 30],
  }
}
