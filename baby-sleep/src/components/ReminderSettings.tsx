import { useCallback, useEffect, useState } from 'react'
import type { ReminderSettings as ReminderSettingsType } from '../types'
import {
  getPermissionUiState,
  isInstalledAsPwa,
  permissionStatusLabel,
  reminderLeadOptions,
  requestPhoneNotificationPermission,
  showSleepReminder,
} from '../lib/reminders'
import type { PermissionUiState } from '../lib/notificationPermission'
import { Card } from './ui/Card'

interface Props {
  settings: ReminderSettingsType
  onChange: (next: ReminderSettingsType) => void
}

export function ReminderSettings({ settings, onChange }: Props) {
  const [permissionState, setPermissionState] = useState<PermissionUiState>(() =>
    getPermissionUiState(),
  )
  const [requesting, setRequesting] = useState(false)
  const { nap: napLeads, bedtime: bedLeads } = reminderLeadOptions()

  const refreshPermission = useCallback(() => {
    setPermissionState(getPermissionUiState())
  }, [])

  useEffect(() => {
    const onFocus = () => refreshPermission()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshPermission])

  const enablePhoneNotifications = async () => {
    setRequesting(true)
    try {
      await requestPhoneNotificationPermission()
      refreshPermission()
    } finally {
      setRequesting(false)
    }
  }

  const canEnableReminders = permissionState === 'granted'
  const showAllowButton =
    permissionState === 'default' && isInstalledAsPwa()

  return (
    <Card
      title="Reminders"
      subtitle="Phone alerts before nap and bedtime wind-down"
    >
      <div className={`permission-status permission-status--${permissionState}`}>
        <span className="permission-status__label">Phone notifications</span>
        <strong>{permissionStatusLabel(permissionState)}</strong>
      </div>

      {permissionState === 'needs-pwa' && (
        <p className="prose" style={{ marginTop: '1rem' }}>
          On iPhone, notifications only work when Little Dream is installed on your{' '}
          <strong>Home Screen</strong>: open this site in Safari → Share →{' '}
          <strong>Add to Home Screen</strong>, then open the app from that icon.
        </p>
      )}

      {permissionState === 'unsupported' && (
        <p className="prose" style={{ marginTop: '1rem' }}>
          This browser cannot show notifications. Use Safari or Chrome on your phone with the
          home-screen app installed.
        </p>
      )}

      {permissionState === 'denied' && (
        <div className="permission-help">
          <p>
            Notifications are blocked. To turn them on:
          </p>
          <ul>
            <li>
              <strong>iPhone:</strong> Settings → Notifications → Little Dream → Allow Notifications
            </li>
            <li>
              <strong>Android:</strong> Settings → Apps → Little Dream → Notifications → On
            </li>
          </ul>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            After changing settings, return here and tap “Check again”.
          </p>
          <button type="button" className="btn btn--ghost" onClick={refreshPermission}>
            Check again
          </button>
        </div>
      )}

      {showAllowButton && (
        <button
          type="button"
          className="btn btn--primary"
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={requesting}
          onClick={() => void enablePhoneNotifications()}
        >
          {requesting ? 'Waiting for permission…' : 'Allow notifications on this phone'}
        </button>
      )}

      {permissionState === 'default' && !isInstalledAsPwa() && (
        <p className="prose" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          Open Little Dream from your <strong>home screen icon</strong> (not the Safari tab), then
          tap the button above.
        </p>
      )}

      <label
        className="reminder-toggle"
        style={{ marginTop: '1.25rem', opacity: canEnableReminders ? 1 : 0.55 }}
      >
        <input
          type="checkbox"
          checked={settings.enabled}
          disabled={!canEnableReminders}
          onChange={(e) => onChange({ ...settings, enabled: e.target.checked })}
        />
        <span>Remind me before nap &amp; bedtime</span>
      </label>

      {!canEnableReminders && permissionState !== 'denied' && permissionState !== 'unsupported' && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Allow phone notifications first to turn on reminders.
        </p>
      )}

      {settings.enabled && canEnableReminders && (
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
          <button
            type="button"
            className="btn btn--ghost"
            style={{ justifySelf: 'start' }}
            onClick={() =>
              void showSleepReminder(
                'Little Dream test',
                'If you see this, phone notifications are working.',
                'little-dream-test',
              )
            }
          >
            Send test notification
          </button>
        </div>
      )}

      <p className="prose" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
        Alerts use your phone&apos;s notification system. Timing is most reliable when the app
        has been opened recently; fully closing the app for a long time may delay alerts on some
        devices.
      </p>
    </Card>
  )
}
