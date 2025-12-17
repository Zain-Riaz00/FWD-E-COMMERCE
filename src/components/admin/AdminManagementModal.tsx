import { useState, useEffect } from 'react'
import { X, UserPlus, Shield, Trash2, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import VerifiedBadge from '@/components/ui/VerifiedBadge'

interface AdminUser {
  email: string
  name: string
  isActive: boolean
  addedAt: string
  addedBy: string
}

interface AdminManagementModalProps {
  isOpen: boolean
  onClose: () => void
  currentAdminEmail: string
}

export default function AdminManagementModal({
  isOpen,
  onClose,
  currentAdminEmail
}: AdminManagementModalProps) {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchAdminUsers()
    }
  }, [isOpen])

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/admins')
      const data = await response.json()
      setAdminUsers(data.adminUsers || [])
    } catch (error) {
      console.error('Error fetching admin users:', error)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('http://localhost:5000/api/admin/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          addedBy: currentAdminEmail
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Admin user added successfully!' })
        setFormData({ email: '', password: '', name: '' })
        fetchAdminUsers()
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add admin' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error adding admin user' })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Are you sure you want to remove admin access for ${email}?`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/remove-admin/${encodeURIComponent(email)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Admin access removed' })
        fetchAdminUsers()
      } else {
        setMessage({ type: 'error', text: 'Failed to remove admin' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error removing admin' })
    }
  }

  const handleToggleStatus = async (email: string, isActive: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/toggle-admin/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        fetchAdminUsers()
      }
    } catch (error) {
      console.error('Error toggling admin status:', error)
    }
  }

  if (!isOpen) return null

  console.log('Rendering AdminManagementModal, adminUsers:', adminUsers)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={(e) => e.stopPropagation()}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl shadow-cyan-500/20"
      >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-400/20 bg-black/40 px-6 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Admin Management</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 rounded-lg p-3 ${
                  message.type === 'success'
                    ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                    : 'bg-red-500/20 border border-red-500/40 text-red-300'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            {/* Add Admin Form */}
            <div className="mb-8 rounded-2xl border border-cyan-400/20 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Add New Admin</h3>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Enter admin name"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-300">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-300">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 pr-10 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                      placeholder="Enter password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Minimum 6 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Admin User'}
                </button>
              </form>
            </div>

            {/* Admin List */}
            <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-semibold text-white">Current Admins</h3>

              <div className="space-y-3">
                {adminUsers.length === 0 ? (
                  <p className="py-8 text-center text-gray-400">No admin users found</p>
                ) : (
                  adminUsers.map((admin) => (
                    <motion.div
                      key={admin.email}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between rounded-lg border border-cyan-400/20 bg-black/20 p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{admin.name}</p>
                          <VerifiedBadge size="sm" />
                          {!admin.isActive && (
                            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{admin.email}</p>
                        <p className="text-xs text-gray-500">
                          Added by {admin.addedBy} on {new Date(admin.addedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(admin.email, admin.isActive)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                            admin.isActive
                              ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          }`}
                          disabled={admin.email === currentAdminEmail}
                        >
                          {admin.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          onClick={() => handleRemoveAdmin(admin.email)}
                          className="rounded-lg bg-red-500/20 p-2 text-red-300 transition hover:bg-red-500/30"
                          disabled={admin.email === currentAdminEmail}
                          title="Remove admin access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
  )
}
