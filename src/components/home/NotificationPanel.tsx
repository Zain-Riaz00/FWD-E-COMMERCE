import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BellRing, Gift, Megaphone, Package2, ShieldCheck, Sparkles, Mail, AlertTriangle, MessageSquare, Users, Volume2, VolumeX } from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'
import { notificationAPI } from '@/services/api'

// Silent mode storage key
const SILENT_MODE_KEY = 'notification_silent_mode'

interface Notification {
  _id?: string
  id?: string
  type: string
  title: string
  message: string
  meta?: string
  status: 'new' | 'read'
  createdAt?: string
  timestamp?: string
  isAdminNotification?: boolean
  relatedId?: string
  relatedType?: string
  linkTo?: string
}

const typeIcon = {
  order: Package2,
  reward: Gift,
  product: Sparkles,
  system: ShieldCheck,
  reply: BellRing,
  contact: Mail,
  inventory: AlertTriangle,
  feedback: MessageSquare,
  admin_action: Users,
  recommendation: Sparkles,
} as const;

const typeAccent: Record<string, string> = {
  order: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
  reward: 'bg-amber-500/15 text-amber-200 border-amber-500/40',
  product: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40',
  system: 'bg-indigo-500/15 text-indigo-200 border-indigo-500/40',
  reply: 'bg-pink-500/15 text-pink-200 border-pink-500/40',
  contact: 'bg-cyan-700/15 text-cyan-200 border-cyan-700/40',
  inventory: 'bg-orange-500/15 text-orange-200 border-orange-500/40',
  feedback: 'bg-purple-500/15 text-purple-200 border-purple-500/40',
  admin_action: 'bg-rose-500/15 text-rose-200 border-rose-500/40',
  recommendation: 'bg-teal-500/15 text-teal-200 border-teal-500/40',
}

// User filters
const userFilterConfig = [
  { key: 'all', label: 'All', types: null },
  { key: 'order', label: 'Orders', types: ['order'] },
  { key: 'reward', label: 'Rewards', types: ['reward'] },
  { key: 'product', label: 'Product drops', types: ['product', 'recommendation'] },
  { key: 'system', label: 'Updates', types: ['system'] },
  { key: 'reply', label: 'Replies', types: ['reply'] },
]

// Admin filters
const adminFilterConfig = [
  { key: 'all', label: 'All', types: null },
  { key: 'order', label: 'Orders', types: ['order'] },
  { key: 'inventory', label: 'Inventory', types: ['inventory'] },
  { key: 'feedback', label: 'Feedback', types: ['feedback', 'contact'] },
  { key: 'reply', label: 'Replies', types: ['reply'] },
  { key: 'admin', label: 'Admin Activity', types: ['admin_action'] },
]

type FilterKey = string

const formatTimeAgo = (ts: string) => {
  const delta = Date.now() - new Date(ts).getTime()
  const minutes = Math.floor(delta / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function NotificationPanel() {
  const [feed, setFeed] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [isSilent, setIsSilent] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(SILENT_MODE_KEY) === 'true'
  })
  const navigate = useNavigate();
  const { isAdmin } = useAdmin()
  
  // Use appropriate filter config based on user role
  const filterConfig = isAdmin ? adminFilterConfig : userFilterConfig

  // Toggle silent mode
  const toggleSilentMode = () => {
    const newValue = !isSilent
    setIsSilent(newValue)
    localStorage.setItem(SILENT_MODE_KEY, String(newValue))
  }

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      const userId = localStorage.getItem('userId') || undefined
      const notifications = await notificationAPI.getAll(userId, isAdmin)
      
      // Transform API response to match component interface
      const transformed: Notification[] = notifications.map((n: any) => ({
        ...n,
        id: n._id || n.id,
        timestamp: n.createdAt || n.timestamp,
        status: n.status || 'new'
      }))
      
      setFeed(transformed)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    
    // Refresh notifications periodically
    const interval = setInterval(loadNotifications, 30000) // Every 30 seconds
    
    // Listen for notification updates
    const handleUpdate = () => loadNotifications()
    window.addEventListener('global-notifications-update', handleUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('global-notifications-update', handleUpdate)
    }
  }, [isAdmin])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const filteredFeed = useMemo(() => {
    let visibleFeed = feed;
    // Filter based on admin status
    if (!isAdmin) {
      // Regular users don't see admin-specific notifications
      visibleFeed = visibleFeed.filter(item => 
        !['contact', 'inventory', 'feedback', 'admin_action'].includes(item.type)
      );
    }
    const selected = filterConfig.find(item => item.key === filter)
    if (!selected || !selected.types) return visibleFeed
    return visibleFeed.filter(item => selected.types?.includes(item.type))
  }, [feed, filter, isAdmin, filterConfig])

  const stats = useMemo(() => {
    const orders = feed.filter(item => item.type === 'order').length
    const rewards = feed.filter(item => item.type === 'reward').length
    const updates = feed.filter(item => item.type === 'product' || item.type === 'system').length
    const replies = feed.filter(item => item.type === 'reply').length
    const unread = feed.filter(item => item.status === 'new').length
    return { orders, rewards, updates, replies, unread }
  }, [feed])

  const handleMarkAllRead = async () => {
    const userId = localStorage.getItem('userId') || undefined
    const success = await notificationAPI.markAllAsRead(userId, isAdmin)
    if (success) {
      setFeed(prev => prev.map(item => ({ ...item, status: 'read' as const })))
    }
  }

  return (
    <section
      id="notifications"
      className="scroll-mt-24 pb-12"
      style={{ paddingTop: 'var(--navbar-offset, 8rem)' }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur transition hover:border-cyan-300/70 hover:bg-cyan-500/10"
          >
            <ArrowLeft className="h-4 w-4 text-cyan-200 transition group-hover:text-cyan-100" />
            Back
          </button>
        </div>
      </div>
      <div className="container mt-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">Stay in the loop</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Activity & notifications</h2>
            <p className="mt-1 text-sm text-zinc-400">Deliveries, drops, rewards, and replies in one clean dashboard.</p>
          </div>
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/10"
          >
            <Megaphone className="h-4 w-4" />
            Mark all read
          </button>
        </div>

        <div className="rounded-[32px] border border-white/5 bg-gradient-to-br from-[#030616]/90 via-[#050E25]/95 to-[#091735]/90 p-6 shadow-[0_40px_120px_rgba(2,6,23,0.45)]">
          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-5 text-white backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Pulse</p>
                <p className="text-3xl font-semibold">{stats.unread}</p>
                <p className="text-xs text-zinc-400">new updates waiting</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Silent Mode Toggle */}
                <button
                  onClick={toggleSilentMode}
                  className={`rounded-2xl border p-3 transition-all ${
                    isSilent 
                      ? 'border-red-400/30 bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'border-green-400/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  }`}
                  title={isSilent ? 'Notifications silenced - Click to enable' : 'Notifications enabled - Click to silence'}
                >
                  {isSilent ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-cyan-200">
                  <BellRing className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                <p className="text-xs uppercase tracking-wide text-emerald-200/80">Orders</p>
                <p className="text-xl font-semibold">{stats.orders}</p>
              </div>
              <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3">
                <p className="text-xs uppercase tracking-wide text-amber-200/80">Rewards</p>
                <p className="text-xl font-semibold">{stats.rewards}</p>
              </div>
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-3">
                <p className="text-xs uppercase tracking-wide text-cyan-200/80">Updates</p>
                <p className="text-xl font-semibold">{stats.updates}</p>
              </div>
              <div className="rounded-xl border border-pink-400/20 bg-pink-500/10 p-3">
                <p className="text-xs uppercase tracking-wide text-pink-200/80">Replies</p>
                <p className="text-xl font-semibold">{stats.replies}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {filterConfig.map(option => (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key as FilterKey)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    filter === option.key
                      ? 'bg-white text-[#050E25]'
                      : 'border border-white/10 text-white/70 hover:border-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/20 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <p className="text-white/80">Live timeline</p>
              <span className="text-xs text-zinc-400">
                {loading ? 'Loading...' : `Showing ${filteredFeed.length} updates`}
              </span>
            </div>
            <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                </div>
              ) : filteredFeed.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-sm text-zinc-400">
                  No notifications yet. Activities will appear here.
                </div>
              ) : (
                filteredFeed.map(item => {
                  const Icon = typeIcon[item.type as keyof typeof typeIcon] || BellRing
                  const accent = typeAccent[item.type] || typeAccent.system
                  const isRead = item.status === 'read'
                  const itemTimestamp = item.timestamp || item.createdAt || new Date().toISOString()
                  
                  // Determine navigation link based on notification type
                  const getNavigationLink = () => {
                    if (item.linkTo) return item.linkTo
                    
                    switch(item.type) {
                      case 'reply':
                        return item.relatedType === 'product' && item.relatedId 
                          ? `/products/${item.relatedId}#comments` 
                          : '/comments'
                      case 'inventory':
                        return '/inventory-alerts'
                      case 'feedback':
                        return '/feedback'
                      case 'order':
                        return item.relatedId ? `/orders/${item.relatedId}` : '/orders'
                      case 'contact':
                        return '/feedback'
                      case 'product':
                        return item.relatedId ? `/products/${item.relatedId}` : '/products'
                      case 'admin_action':
                        return '/admin-logs'
                      default:
                        return null
                    }
                  }
                  
                  const linkTo = getNavigationLink()
                  
                  const handleClick = async () => {
                    // Mark as read when clicked
                    if (item.status === 'new' && item._id) {
                      await notificationAPI.markAsRead(item._id)
                      setFeed(prev => prev.map(n => 
                        n._id === item._id ? { ...n, status: 'read' as const } : n
                      ))
                    }
                    if (linkTo) {
                      navigate(linkTo)
                    }
                  }
                  
                  return (
                    <div
                      key={item.id || item._id}
                      onClick={handleClick}
                      className={`group flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-cyan-400/40 hover:bg-white/10 ${linkTo ? 'cursor-pointer' : ''} ${isRead ? 'opacity-50' : ''}`}
                    >
                      <div className={`rounded-2xl border px-3 py-2 ${accent}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-white">
                          <p className="font-semibold">{item.title}</p>
                          {item.status === 'new' && (
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/90">
                              New
                            </span>
                          )}
                          <span className="ml-auto text-xs text-zinc-400">{formatTimeAgo(itemTimestamp)}</span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-300">{item.message}</p>
                        {item.meta && <p className="mt-1 text-xs text-zinc-500">{item.meta}</p>}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
