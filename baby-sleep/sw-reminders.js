/**
 * Service worker extension: schedule local notifications for nap/bedtime.
 * Required for iOS home-screen PWAs (new Notification() does not work there).
 */
const activeTimers = new Map()

function clearAllTimers() {
  for (const id of activeTimers.values()) {
    clearTimeout(id)
  }
  activeTimers.clear()
}

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || data.type !== 'SCHEDULE_REMINDERS') return

  clearAllTimers()

  const reminders = data.reminders || []
  const icon = data.icon
  const openUrl = data.openUrl || './'

  for (const r of reminders) {
    const delay = r.fireAt - Date.now()
    if (delay <= 0 || delay > 48 * 60 * 60 * 1000) continue

    const timer = setTimeout(() => {
      self.registration
        .showNotification(r.title, {
          body: r.body,
          tag: r.tag,
          icon,
          data: { url: openUrl },
        })
        .catch(() => {})
    }, delay)

    activeTimers.set(r.tag, timer)
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || './'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
      return undefined
    }),
  )
})
