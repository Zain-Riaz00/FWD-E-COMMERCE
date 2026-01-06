import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Clock, Settings, UserPlus, UserMinus, Edit, Trash, Search, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '@/contexts/AdminContext'
import { logsAPI } from '@/services/api'

interface AdminLog {
  id: string
  adminId: string
  adminName: string
  adminEmail: string
  action: 'login' | 'logout' | 'product_add' | 'product_edit' | 'product_delete' | 'user_ban' | 'user_unban' | 'settings_change' | 'admin_add' | 'admin_remove' | 'order_update' | 'discount_create'
  details?: string
  timestamp: string
  ipAddress?: string
}

// Cache for logs
let cachedAdminLogs: AdminLog[] | null = null

export default function AdminLogsPage() {
  const navigate = useNavigate()
  const { isPermanentAdmin } = useAdmin()
  const [logs, setLogs] = useState<AdminLog[]>(cachedAdminLogs || [])
  const [loading, setLoading] = useState(cachedAdminLogs === null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')

  useEffect(() => {
    if (!isPermanentAdmin) {
      navigate('/')
      return
    }
    if (cachedAdminLogs === null) {
      loadLogs()
    }
  }, [isPermanentAdmin, navigate])

  async function loadLogs() {
    setLoading(true)
    try {
      // Fetch real admin logs from API
      const logsData = await logsAPI.getAdminLogs()
      
      // Transform logs to match the expected interface
      const transformedLogs: AdminLog[] = logsData.map((log: any) => ({
        id: log._id || log.id || `ALOG-${Date.now()}`,
        adminId: log.adminId || log.admin?._id || 'N/A',
        adminName: log.adminName || log.admin?.username || 'Unknown Admin',
        adminEmail: log.adminEmail || log.admin?.email || 'N/A',
        action: log.action || 'login',
        details: log.details || log.description,
        timestamp: log.timestamp || log.createdAt || new Date().toISOString(),
        ipAddress: log.ipAddress
      }))

      cachedAdminLogs = transformedLogs
      setLogs(transformedLogs)
    } catch (error) {
      console.error('Error loading logs:', error)
      // On error, show empty state
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: AdminLog['action']) => {
    switch (action) {
      case 'login':
      case 'logout':
        return <Shield className="w-4 h-4" />
      case 'product_add':
        return <UserPlus className="w-4 h-4" />
      case 'product_edit':
        return <Edit className="w-4 h-4" />
      case 'product_delete':
        return <Trash className="w-4 h-4" />
      case 'admin_add':
        return <UserPlus className="w-4 h-4" />
      case 'admin_remove':
        return <UserMinus className="w-4 h-4" />
      case 'settings_change':
        return <Settings className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getActionColor = (action: AdminLog['action']) => {
    if (action.includes('add') || action === 'login') {
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    }
    if (action.includes('delete') || action.includes('remove') || action.includes('ban')) {
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    if (action.includes('edit') || action.includes('update') || action.includes('change')) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
    if (action === 'logout') {
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
    return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  }

  const formatAction = (action: string) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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
    const matchesSearch = log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterAction === 'all' || log.action === filterAction
    return matchesSearch && matchesFilter
  })

  if (!isPermanentAdmin) return null

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
          Admin Activity Log
        </h1>
        <p className="text-cyan-200/70">Track all administrative actions and changes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="backdrop-blur-xl bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-white/50 text-sm">Total Actions</p>
          <p className="text-2xl font-bold text-white">{logs.length}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 p-4 rounded-xl border border-green-500/20">
          <p className="text-white/50 text-sm">Additions</p>
          <p className="text-2xl font-bold text-green-400">{logs.filter(l => l.action.includes('add')).length}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 p-4 rounded-xl border border-blue-500/20">
          <p className="text-white/50 text-sm">Modifications</p>
          <p className="text-2xl font-bold text-blue-400">{logs.filter(l => l.action.includes('edit') || l.action.includes('update') || l.action.includes('change')).length}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 p-4 rounded-xl border border-red-500/20">
          <p className="text-white/50 text-sm">Deletions</p>
          <p className="text-2xl font-bold text-red-400">{logs.filter(l => l.action.includes('delete') || l.action.includes('remove')).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by admin or action..."
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
            <option value="product_add">Product Add</option>
            <option value="product_edit">Product Edit</option>
            <option value="product_delete">Product Delete</option>
            <option value="admin_add">Admin Add</option>
            <option value="admin_remove">Admin Remove</option>
            <option value="settings_change">Settings Change</option>
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
          <Shield className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 text-lg">No admin logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="backdrop-blur-xl bg-white/5 p-4 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getActionColor(log.action).split(' ')[0]} shrink-0`}>
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-white">{log.adminName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                      {formatAction(log.action)}
                    </span>
                  </div>
                  <p className="text-sm text-white/50 mb-1">{log.adminEmail}</p>
                  {log.details && (
                    <p className="text-sm text-white/70 bg-white/5 px-3 py-2 rounded-lg mt-2">
                      {log.details}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-cyan-400">{formatTime(log.timestamp)}</p>
                  <p className="text-xs text-white/40">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
