import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, LogIn, LogOut, Clock, Mail, Search, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '@/contexts/AdminContext'
import { logsAPI } from '@/services/api'

interface UserLog {
  id: string
  userId: string
  userName: string
  email: string
  action: 'login' | 'logout' | 'register' | 'password_reset' | 'profile_update' | 'purchase'
  timestamp: string
  ipAddress?: string
  device?: string
}

// Cache for logs
let cachedUserLogs: UserLog[] | null = null

export default function UserLogsPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAdmin()
  const [logs, setLogs] = useState<UserLog[]>(cachedUserLogs || [])
  const [loading, setLoading] = useState(cachedUserLogs === null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    if (cachedUserLogs === null) {
      loadLogs()
    }
  }, [isAdmin, navigate])

  async function loadLogs() {
    setLoading(true)
    try {
      // Fetch real user logs from API
      const logsData = await logsAPI.getUserLogs()
      
      // Transform logs to match the expected interface
      const transformedLogs: UserLog[] = logsData.map((log: any) => ({
        id: log._id || log.id || `LOG-${Date.now()}`,
        userId: log.userId || log.user?._id || 'N/A',
        userName: log.userName || log.user?.username || 'Unknown User',
        email: log.email || log.user?.email || 'N/A',
        action: log.action || 'login',
        timestamp: log.timestamp || log.createdAt || new Date().toISOString(),
        ipAddress: log.ipAddress,
        device: log.device || log.userAgent || 'Unknown'
      }))

      cachedUserLogs = transformedLogs
      setLogs(transformedLogs)
    } catch (error) {
      console.error('Error loading logs:', error)
      // On error, show empty state
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: UserLog['action']) => {
    switch (action) {
      case 'login': return <LogIn className="w-4 h-4" />
      case 'logout': return <LogOut className="w-4 h-4" />
      case 'register': return <Users className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getActionColor = (action: UserLog['action']) => {
    switch (action) {
      case 'login': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'logout': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'register': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'password_reset': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'profile_update': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'purchase': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterAction === 'all' || log.action === filterAction
    return matchesSearch && matchesFilter
  })

  if (!isAdmin) return null

  return (
    <div className="min-h-screen pt-16 pb-12 w-full px-4 sm:px-6 lg:px-8 bg-[#050810]">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-cyan-200/70 hover:text-cyan-100 transition-colors mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Users Activity Log
        </h1>
        <p className="text-cyan-200/70">Track all user activities and sessions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['login', 'logout', 'register', 'purchase'].map(action => {
          const count = logs.filter(l => l.action === action).length
          return (
            <div key={action} className="backdrop-blur-xl bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-white/50 text-sm capitalize">{action}s</p>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="pl-10 pr-8 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="register">Register</option>
            <option value="purchase">Purchase</option>
            <option value="password_reset">Password Reset</option>
            <option value="profile_update">Profile Update</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-white/60 mt-4">Loading logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 p-12 rounded-2xl border border-white/10 text-center">
          <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 text-lg">No logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="backdrop-blur-xl bg-white/5 p-4 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-4"
            >
              <div className={`p-2 rounded-lg ${getActionColor(log.action).split(' ')[0]}`}>
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white truncate">{log.userName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                    {log.action.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3" />
                    {log.email}
                  </span>
                  {log.device && (
                    <span className="hidden sm:inline truncate">{log.device}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-cyan-400">{formatTime(log.timestamp)}</p>
                <p className="text-xs text-white/40">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
