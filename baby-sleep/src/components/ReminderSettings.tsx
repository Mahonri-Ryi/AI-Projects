import { useState } from 'react'
import type { ReminderSettings as ReminderSettingsType } from '../types'
import {
  notificationsSupported,
  reminderLeadOptions,
  requestNotificationPermission,
} from '../lib/reminders'
import { Card } from './ui/Card'

interface Props {
  settings: ReminderSettingsType
  onChange: (next: ReminderSettingsType) => void
}

export function ReminderSettings({ settings, onChange }: Props) {
  const [permissionHint, setPermissionHint] = useState<string | null>(null)
  const supported = notificationsSupported()
  const { nap: napLeads, bedtime: bedLeads } = reminderLeadOptions()

  const toggleEnabled = async () => {
    if (!settings.enabled) {
      if (!supported) {
        setPermissionHint('Notifications are not supported in this browser.')
        return
      }
      const perm = await requestNotificationPermission()
      if (perm !== 'granted') {
        setPermissionHint('Allow notifications in your browser to enable reminders.')
        return
      }
      setPermissionHint(null)
      onChange({ ...settings, enabled: true })
      return
    }
    onChange({ ...settings, enabled: false })
  }

  return (
    <Card
      title="Reminders"
      subtitle="Optional alerts before nap and bedtime wind-down"
    >
      {!supported && (
        <p className="prose" style={{ marginBottom: '1rem' }}>
          Your browser does not support notifications. Open Little Dream on your phone or desktop
          when it is time to check the schedule.
        </p>
      )}

      <label className="reminder-toggle">
        <input
          type="checkbox"
          checked={settings.enabled}
          disabled={!supported}
          onChange={() => void toggleEnabled()}
        />
        <span>Notify before nap &amp; bedtime</span>
      </label>

      {permissionHint && (
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--warning)',
            marginTop: '0.75rem',
          }}
        >
          {permissionHint}
        </p>
      )}

      {settings.enabled && (
        <div className="reminder-leads">
          <label>
            <span>Nap reminder</span>
            <select
              value={settings.napMinutesBefore}
              onChange={(e) =>
                onChange({ ...settings, napMinutesBefore: Number(e.target.value) })
              }
            >
              {napLeads.map((m) => (
                <option key={m} value={m}>
                  {m} min before wind-down
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Bedtime reminder</span>
            <select
              value={settings.bedtimeMinutesBefore}
              onChange={(e) =>
                onChange({ ...settings, bedtimeMinutesBefore: Number(e.target.value) })
              }
            >
              {bedLeads.map((m) => (
                <option key={m} value={m}>
                  {m} min before bedtime
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <p className="prose" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
        Reminders fire while this app is open or recently used. For best results, add Little Dream
        to your home screen and keep notifications allowed.
      </p>
    </Card>
  )
}
