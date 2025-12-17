export type ActivityCategory = 'order' | 'product' | 'reward' | 'system' | 'reply' | 'contact'

export type ActivityNotification = {
  id: string
  type: ActivityCategory
  title: string
  message: string
  timestamp: string
  meta?: string
  status: 'new' | 'read'
  accent?: string
  source?: 'seed' | 'live'
}

export const GLOBAL_NOTIFICATION_KEY = 'global-notifications'

const isBrowser = () => typeof window !== 'undefined'

export function loadGlobalNotifications(): ActivityNotification[] {
  if (!isBrowser()) return []
  const stored = localStorage.getItem(GLOBAL_NOTIFICATION_KEY)
  if (!stored) return []
  try {
    const parsed = JSON.parse(stored) as ActivityNotification[]
    return Array.isArray(parsed) ? parsed.map(item => ({ ...item, source: 'live' })) : []
  } catch {
    return []
  }
}

export function saveGlobalNotifications(entries: ActivityNotification[]) {
  if (!isBrowser()) return
  localStorage.setItem(GLOBAL_NOTIFICATION_KEY, JSON.stringify(entries.map(item => ({ ...item, source: 'live' }))))
}

export function appendGlobalNotification(entry: ActivityNotification, limit = 32) {
  const normalized: ActivityNotification = { ...entry, source: 'live' }
  const current = loadGlobalNotifications().filter(item => item.id !== normalized.id)
  const updated = [normalized, ...current].slice(0, limit)
  saveGlobalNotifications(updated)
  dispatchGlobalNotificationEvent()
  return updated
}

export function dispatchGlobalNotificationEvent() {
  if (!isBrowser()) return
  window.dispatchEvent(new CustomEvent('global-notifications-update'))
}

export function combineWithSeeds(
  seeds: ActivityNotification[],
  live: ActivityNotification[]
): ActivityNotification[] {
  const map = new Map<string, ActivityNotification>()
  ;[...live, ...seeds].forEach(item => {
    if (!map.has(item.id)) {
      map.set(item.id, item)
    }
  })
  const result = Array.from(map.values())
  return result.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

export function markAllLiveNotificationsRead(list: ActivityNotification[]) {
  const liveOnly: ActivityNotification[] = list.filter(item => item.source !== 'seed').map(item => ({ ...item, status: 'read' as const, source: 'live' as const }))
  saveGlobalNotifications(liveOnly)
  dispatchGlobalNotificationEvent()
}
