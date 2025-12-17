import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Trash2, Mail, Lock, Shield, X, LogOut, Edit, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CustomAlert from '../components/ui/CustomAlert'
import ConfirmDialog from '../components/ui/ConfirmDialog'

interface Admin {
  _id: string
  email: string
  password: string
  name: string
  role: string
  isPermanentAdmin?: boolean
  createdAt: string
}

export default function ManageAdminsPage() {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; adminId: string; adminEmail: string }>({
    isOpen: false,
    adminId: '',
    adminEmail: ''
  })
  const [transferConfirm, setTransferConfirm] = useState<{ isOpen: boolean; adminId: string; adminName: string }>({
    isOpen: false,
    adminId: '',
    adminName: ''
  })
  const [alert, setAlert] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  })
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin'
  })

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users')
      const data = await response.json()
      setAdmins(data)
    } catch (error) {
      console.error('Error loading admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentPermanentAdmin = admins.find(a => a.isPermanentAdmin)

  const handleTransferPermanentAdmin = async (newAdminId: string) => {
    if (!currentPermanentAdmin) {
      setAlert({ isOpen: true, type: 'error', message: 'No permanent admin found' })
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${newAdminId}/transfer-permanent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPermanentAdminId: currentPermanentAdmin._id
        })
      })

      if (response.ok) {
        setTransferConfirm({ isOpen: false, adminId: '', adminName: '' })
        setAlert({ isOpen: true, type: 'success', message: 'Permanent admin role transferred successfully!' })
        loadAdmins()
      } else {
        const error = await response.json()
        setTransferConfirm({ isOpen: false, adminId: '', adminName: '' })
        setAlert({ isOpen: true, type: 'error', message: error.message || 'Failed to transfer role' })
      }
    } catch (error) {
      console.error('Error transferring role:', error)
      setTransferConfirm({ isOpen: false, adminId: '', adminName: '' })
      setAlert({ isOpen: true, type: 'error', message: 'Failed to transfer role' })
    }
  }

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      setAlert({ isOpen: true, type: 'error', message: 'Please fill all fields' })
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdmin.name,
          email: newAdmin.email,
          password: newAdmin.password,
          isAdmin: true
        })
      })

      if (response.ok) {
        await response.json()
        setNewAdmin({ email: '', password: '', name: '', role: 'admin' })
        setIsAddingAdmin(false)
        setAlert({ 
          isOpen: true, 
          type: 'success', 
          message: 'Admin added successfully!' 
        })
        loadAdmins()
      } else {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        
        // Check for duplicate email error
        if (errorData.message && (errorData.message.includes('already exists') || errorData.message.includes('duplicate') || errorData.message.includes('E11000'))) {
          setAlert({ isOpen: true, type: 'error', message: 'This email is already registered. Please use a different email.' })
        } else {
          setAlert({ isOpen: true, type: 'error', message: errorData.message || 'Failed to add admin' })
        }
      }
    } catch (error) {
      console.error('Error adding admin:', error)
      setAlert({ isOpen: true, type: 'error', message: `Failed to add admin: ${error instanceof Error ? error.message : 'Please try again.'}` })
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Close the confirmation dialog
        setDeleteConfirm({ isOpen: false, adminId: '', adminEmail: '' })
        // Update the admins list
        setAdmins(admins.filter(a => a._id !== id))
        // Show success message
        setAlert({ isOpen: true, type: 'success', message: 'Admin deleted successfully!' })
      } else {
        setDeleteConfirm({ isOpen: false, adminId: '', adminEmail: '' })
        setAlert({ isOpen: true, type: 'error', message: 'Failed to delete admin' })
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      setDeleteConfirm({ isOpen: false, adminId: '', adminEmail: '' })
      setAlert({ isOpen: true, type: 'error', message: 'Failed to delete admin' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated')
    navigate('/auth')
  }

  return (
    <div className="min-h-screen pt-16 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent mb-1">
                Manage Admins
              </h1>
              <p className="text-white/60 text-sm">Control who has access to admin features</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all backdrop-blur-sm border border-red-500/30 hover:scale-105 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/30 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Total Admins</p>
                <p className="text-2xl font-bold text-white">{admins.length}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-xl border border-cyan-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/30 rounded-lg">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Active Sessions</p>
                <p className="text-2xl font-bold text-white">{admins.length}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 p-4 rounded-xl border border-rose-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/30 rounded-lg">
                <Edit className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Permissions</p>
                <p className="text-2xl font-bold text-white">Full</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Admin Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <button
            onClick={() => setIsAddingAdmin(true)}
            className="flex items-center gap-2 px-5 py-2.5 backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50 transition-all hover:scale-105 font-medium text-sm shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New Admin
          </button>
        </motion.div>

        {/* Admins List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-white/60 mt-4">Loading admins...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 p-12 rounded-2xl border border-white/10 text-center">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No admins found</p>
              <p className="text-white/40 mt-2">Click "Add New Admin" to get started</p>
            </div>
          ) : (
            admins.map((admin, index) => (
              <motion.div
                key={admin._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="backdrop-blur-xl bg-white/5 p-4 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg">
                      <Shield className="w-5 h-5 text-purple-400" />
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </div>
                        <p className="text-white font-medium text-sm break-all">{admin.email}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
                          <Lock className="w-3.5 h-3.5" />
                          Password
                        </div>
                        <p className="text-white font-mono text-sm">••••••••</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
                          <Users className="w-3.5 h-3.5" />
                          Name
                        </div>
                        <p className="text-white font-medium text-sm break-words">{admin.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Transfer Permanent Admin button - only show if current user is permanent admin and this is not them */}
                    {currentPermanentAdmin && !admin.isPermanentAdmin && (
                      <button
                        onClick={() => setTransferConfirm({ isOpen: true, adminId: admin._id, adminName: admin.name })}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Transfer permanent admin"
                        title="Make permanent admin"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Delete button - hide for permanent admin */}
                    {!admin.isPermanentAdmin && (
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, adminId: admin._id, adminEmail: admin.email })}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Delete admin"
                        title="Delete admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span>Role: <span className="text-purple-400 font-medium">{admin.role}</span></span>
                    <span>•</span>
                    <span>Created: {new Date(admin.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {admin.isPermanentAdmin && (
                      <div className="px-2.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium border border-yellow-500/30">
                        Permanent Admin
                      </div>
                    )}
                    <div className="px-2.5 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                      Active
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {isAddingAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsAddingAdmin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="backdrop-blur-xl bg-slate-900/90 p-6 rounded-2xl border border-white/20 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Add New Admin
                </h2>
                <button
                  onClick={() => setIsAddingAdmin(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    placeholder="Admin name"
                    aria-label="Admin name"
                    title="Enter admin name"
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    placeholder="admin@example.com"
                    aria-label="Admin email"
                    title="Enter admin email"
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Password</label>
                  <input
                    type="text"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    placeholder="Enter password"
                    aria-label="Admin password"
                    title="Enter admin password"
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Role</label>
                  <select
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                    aria-label="Admin role"
                    title="Select admin role"
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  >
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    onClick={() => setIsAddingAdmin(false)}
                    className="flex-1 px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10"
                    aria-label="Cancel adding admin"
                    title="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAdmin}
                    className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium"
                    aria-label="Add new admin"
                    title="Add Admin"
                  >
                    Add Admin
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, adminId: '', adminEmail: '' })}
        onConfirm={() => handleDeleteAdmin(deleteConfirm.adminId)}
        title="Delete Admin"
        message={`Are you sure you want to delete ${deleteConfirm.adminEmail}? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Confirm Transfer Permanent Admin Dialog */}
      <ConfirmDialog
        isOpen={transferConfirm.isOpen}
        onCancel={() => setTransferConfirm({ isOpen: false, adminId: '', adminName: '' })}
        onConfirm={() => handleTransferPermanentAdmin(transferConfirm.adminId)}
        title="Transfer Permanent Admin Role"
        message={`Are you sure you want to transfer the permanent admin role to ${transferConfirm.adminName}? You will become a regular admin and will lose permanent admin privileges.`}
        variant="warning"
        confirmText="Transfer Role"
        cancelText="Cancel"
      />

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        type={alert.type}
        message={alert.message}
      />
    </div>
  )
}
