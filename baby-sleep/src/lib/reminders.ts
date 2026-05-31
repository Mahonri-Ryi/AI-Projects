import { addMinutes, subMinutes } from 'date-fns'
import type { NextBedtimePrediction, NextNapPrediction, ReminderSettings } from '../types'

export type ReminderKind = 'nap' | 'bedtime'

export interface DueReminder {
  kind: ReminderKind
  fireAt: Date
  title: string
  body: string
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function showSleepReminder(title: string, body: string, tag: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  try {
    new Notification(title, {
      body,
      tag,
      icon: `${import.meta.env.BASE_URL}favicon.svg`,
    })
  } catch {
    // Some browsers block notifications outside secure contexts
  }
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
        body: `Start calming for nap around ${settings.napMinutesBefore} minutes — watch sleepy cues.`,
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
        body: `Begin evening routine in about ${settings.bedtimeMinutesBefore} minutes.`,
      })
    }
  }

  return due
}

/** Fire if we're within 1 minute after the scheduled reminder time. */
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

export function nextReminderCheckMs(due: DueReminder[], now: Date): number {
  const upcoming = due
    .map((r) => r.fireAt.getTime() - now.getTime())
    .filter((ms) => ms > 0)
  if (upcoming.length === 0) return 30_000
  return Math.min(30_000, Math.max(5_000, Math.min(...upcoming)))
}

export function formatReminderPreview(
  target: Date,
  minutesBefore: number,
): string {
  return formatTime(addMinutes(target, -minutesBefore))
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
