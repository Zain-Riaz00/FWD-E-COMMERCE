import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, MapPin, Camera, HelpCircle, LogOut, Save, Edit2, ArrowLeft, Shield, Reply, Pause } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import VerifiedBadge from '@/components/ui/VerifiedBadge'
import { isGuestUser, clearAllAuthState } from '@/utils/guestUser'
import GuestRestrictionModal from '@/components/ui/GuestRestrictionModal'
import { useAdmin } from '@/contexts/AdminContext'
import { siteSettingsAPI } from '@/services/api'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'password' | 'help' | 'replies' | 'freeze'>('profile')
  const { isAdmin, logout: adminLogout } = useAdmin()
  
  // Initialize profile data from localStorage
  const [profileData, setProfileData] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile')
    return savedProfile ? JSON.parse(savedProfile) : {
      name: 'Zain Riaz',
      email: 'zain.riaz@example.com',
      phone: '+92 309 8261850',
      address: '123 Main St',
      city: 'Lahore',
      zip: '54000',
      country: 'Pakistan'
    }
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Freeze settings
  const [freezeMessage, setFreezeMessage] = useState('The website is currently under maintenance. Please check back later.')
  const [freezeDuration, setFreezeDuration] = useState('')
  const [isFrozen, setIsFrozen] = useState(false)
  const [freezeLoading, setFreezeLoading] = useState(false)

  // Check if user is guest and redirect immediately
  useEffect(() => {
    if (isGuestUser()) {
      navigate('/')
    }
  }, [navigate])

  // Load current freeze status
  useEffect(() => {
    const loadFreezeStatus = async () => {
      const settings = await siteSettingsAPI.getSettings()
      if (settings) {
        setIsFrozen(settings.isFrozen)
        setFreezeMessage(settings.freezeMessage || 'The website is currently under maintenance. Please check back later.')
      }
    }
    loadFreezeStatus()
  }, [])

  // Don't render anything for guest users
  if (isGuestUser()) {
    return null
  }
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev: typeof profileData) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData))
    setIsEditing(false)
    console.log('Saved:', profileData)
  }

  const handleSaveAddress = () => {
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData))
    setIsEditingAddress(false)
    console.log('Saved address:', profileData)
  }

  const handleUpdatePassword = () => {
    console.log('Updating password...')
    // Reset form after update
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleSignOut = () => {
    // Clear all auth states properly
    adminLogout()
    clearAllAuthState()
    navigate('/auth')
  }

  const handleFreezeWebsite = async () => {
    if (freezeLoading) return
    setFreezeLoading(true)
    
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      await siteSettingsAPI.updateFreeze({
        isFrozen: true,
        freezeMessage: freezeMessage || 'The website is currently under maintenance. Please check back later.',
        freezeDuration: freezeDuration ? parseInt(freezeDuration) : undefined,
        userId: userData._id || userData.id,
        userName: userData.name,
        userEmail: userData.email
      })
      setIsFrozen(true)
      alert('Website has been frozen successfully!')
    } catch (error) {
      console.error('Failed to freeze website:', error)
      alert('Failed to freeze website. Please try again.')
    } finally {
      setFreezeLoading(false)
    }
  }

  const handleUnfreezeWebsite = async () => {
    if (freezeLoading) return
    setFreezeLoading(true)
    
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      await siteSettingsAPI.updateFreeze({
        isFrozen: false,
        userId: userData._id || userData.id,
        userName: userData.name,
        userEmail: userData.email
      })
      setIsFrozen(false)
      alert('Website has been unfrozen successfully!')
    } catch (error) {
      console.error('Failed to unfreeze website:', error)
      alert('Failed to unfreeze website. Please try again.')
    } finally {
      setFreezeLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 pb-12 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Back Button & Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cyan-200/70 dark:text-cyan-200/70 text-blue-700 hover:text-cyan-100 dark:hover:text-cyan-100 hover:text-blue-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-cyan-100 dark:text-cyan-100 text-blue-700 mb-2">My Profile</h1>
          <p className="text-cyan-200/70 dark:text-cyan-200/70 text-slate-700">Manage your account settings and preferences</p>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/20 dark:to-blue-500/20 from-blue-100/80 to-indigo-100/80 ring-1 ring-cyan-400/40 dark:ring-cyan-400/40 ring-blue-500/60 text-cyan-100 dark:text-cyan-100 text-blue-700'
                  : 'text-cyan-200/70 dark:text-cyan-200/70 text-slate-700 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 hover:bg-blue-100/50 hover:text-cyan-100 dark:hover:text-cyan-100 hover:text-blue-900'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="font-medium">Profile Info</span>
            </button>

            {/* Address - Only for non-admin users */}
            {!isAdmin && (
              <button
                onClick={() => setActiveTab('address')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'address'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-400/40 text-cyan-100'
                    : 'text-cyan-200/70 hover:bg-cyan-500/10 hover:text-cyan-100'
                }`}
              >
                <MapPin className="h-5 w-5" />
                <span className="font-medium">Address</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'password'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-400/40 text-cyan-100'
                  : 'text-cyan-200/70 hover:bg-cyan-500/10 hover:text-cyan-100'
              }`}
            >
              <Lock className="h-5 w-5" />
              <span className="font-medium">Change Password</span>
            </button>

            {/* Help & Support - Only for non-admin users */}
            {!isAdmin && (
              <button
                onClick={() => setActiveTab('help')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'help'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-400/40 text-cyan-100'
                    : 'text-cyan-200/70 hover:bg-cyan-500/10 hover:text-cyan-100'
                }`}
              >
                <HelpCircle className="h-5 w-5" />
                <span className="font-medium">Help & Support</span>
              </button>
            )}

            {/* Replies section - for all users */}
            <button
              onClick={() => setActiveTab('replies')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'replies'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-400/40 text-cyan-100'
                  : 'text-cyan-200/70 hover:bg-cyan-500/10 hover:text-cyan-100'
              }`}
            >
              <Reply className="h-5 w-5" />
              <span className="font-medium">My Replies</span>
            </button>

            {/* Admin-specific navigation - Account Control only */}
            {isAdmin && (
              <>
                <div className="pt-4 mt-4 border-t border-purple-400/20">
                  <p className="text-xs text-purple-300/60 uppercase font-semibold mb-2 px-2">Admin Controls</p>
                </div>

                <button
                  onClick={() => setActiveTab('freeze')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'freeze'
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 ring-1 ring-purple-400/40 text-purple-300'
                      : 'text-purple-300/70 hover:bg-purple-500/10 hover:text-purple-200'
                  }`}
                >
                  <Pause className="h-5 w-5" />
                  <span className="font-medium">Account Control</span>
                </button>

                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 ring-1 ring-purple-400/40 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                >
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Manage Admins</span>
                </button>
              </>
            )}

            <div className="pt-4 mt-4 border-t border-cyan-400/10">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:ring-1 hover:ring-red-400/20 transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="bg-gradient-to-br from-[#0a0e1a]/80 to-[#020304]/80 backdrop-blur-sm rounded-2xl ring-1 ring-cyan-400/20 p-8">
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-cyan-100">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-100 rounded-lg ring-1 ring-cyan-400/40 hover:bg-cyan-500/30 transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-cyan-200/70 hover:text-cyan-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 ring-2 ring-cyan-400/40 flex items-center justify-center">
                      <User className="h-12 w-12 text-cyan-100" />
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center ring-2 ring-[#0a0e1a] hover:bg-cyan-600 transition-colors">
                        <Camera className="h-4 w-4 text-white" />
                      </button>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-cyan-100">{profileData.name}</h3>
                      {isAdmin && <VerifiedBadge size="md" />}
                    </div>
                    <p className="text-cyan-200/70">{profileData.email}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-cyan-200/80 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-black/30 dark:bg-black/30 bg-cyan-500/10 border border-cyan-400/20 dark:border-cyan-400/20 border-cyan-400/40 rounded-xl text-cyan-100 dark:text-cyan-100 text-slate-900 placeholder-cyan-200/40 dark:placeholder-cyan-200/40 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 transition-all backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-200/80 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-black/30 dark:bg-black/30 bg-cyan-500/10 border border-cyan-400/20 dark:border-cyan-400/20 border-cyan-400/40 rounded-xl text-cyan-100 dark:text-cyan-100 text-slate-900 placeholder-cyan-200/40 dark:placeholder-cyan-200/40 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 transition-all backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-200/80 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-black/30 dark:bg-black/30 bg-cyan-500/10 border border-cyan-400/20 dark:border-cyan-400/20 border-cyan-400/40 rounded-xl text-cyan-100 dark:text-cyan-100 text-slate-900 placeholder-cyan-200/40 dark:placeholder-cyan-200/40 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 transition-all backdrop-blur-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-cyan-100">Shipping Address</h2>
                  {!isEditingAddress ? (
                    <button
                      onClick={() => setIsEditingAddress(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-100 rounded-lg ring-1 ring-cyan-400/40 hover:bg-cyan-500/30 transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingAddress(false)}
                        className="px-4 py-2 text-cyan-200/70 hover:text-cyan-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAddress}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-cyan-200/80 mb-2">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      disabled={!isEditingAddress}
                      className="w-full px-4 py-3 bg-black/30 dark:bg-black/30 bg-cyan-500/10 border border-cyan-400/20 dark:border-cyan-400/20 border-cyan-400/40 rounded-xl text-cyan-100 dark:text-cyan-100 text-slate-900 placeholder-cyan-200/40 dark:placeholder-cyan-200/40 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 transition-all backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-200/80 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleProfileChange}
                      disabled={!isEditingAddress}
                      className="w-full px-4 py-3 bg-black/30 dark:bg-black/30 bg-cyan-500/10 border border-cyan-400/20 dark:border-cyan-400/20 border-cyan-400/40 rounded-xl text-cyan-100 dark:text-cyan-100 text-slate-900 placeholder-cyan-200/40 dark:placeholder-cyan-200/40 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 transition-all backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-200/80 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={profileData.zip}
                      onChange={handleProfileChange}
                      disabled={!isEditingAddress}
                      className="w-full px-4 py-3 bg-black/30 dark:bg-black/30 bg-cyan-500/10 border border-cyan-400/20 dark:border-cyan-400/20 border-cyan-400/40 rounded-xl text-cyan-100 dark:text-cyan-100 text-slate-900 placeholder-cyan-200/40 dark:placeholder-cyan-200/40 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 transition-all backdrop-blur-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-cyan-200/80 mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={profileData.country}
                      onChange={handleProfileChange}
                      disabled={!isEditingAddress}
                      className="w-full px-4 py-3 bg-black/30 dark:bg-black/30 bg-cyan-500/10 border border-cyan-400/20 dark:border-cyan-400/20 border-cyan-400/40 rounded-xl text-cyan-100 dark:text-cyan-100 text-slate-900 placeholder-cyan-200/40 dark:placeholder-cyan-200/40 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 transition-all backdrop-blur-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-cyan-100">Change Password</h2>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-cyan-200/80 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-black/30 border border-cyan-400/20 rounded-xl text-cyan-100 placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-200/80 mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-black/30 border border-cyan-400/20 rounded-xl text-cyan-100 placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-200/80 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-black/30 border border-cyan-400/20 rounded-xl text-cyan-100 placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    onClick={handleUpdatePassword}
                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
                  >
                    Update Password
                  </button>
                </div>
              </motion.div>
            )}

            {/* Help & Support Tab */}
            {activeTab === 'help' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-cyan-100">Help & Support</h2>

                <div className="space-y-4">
                  <div className="p-6 bg-cyan-500/10 rounded-xl ring-1 ring-cyan-400/20">
                    <h3 className="text-lg font-semibold text-cyan-100 mb-2">Contact Support</h3>
                    <p className="text-cyan-200/70 mb-4">Need help? Our support team is here for you.</p>
                    <a href="mailto:support@ecom.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      support@ecom.com
                    </a>
                  </div>

                  <div className="p-6 bg-cyan-500/10 rounded-xl ring-1 ring-cyan-400/20">
                    <h3 className="text-lg font-semibold text-cyan-100 mb-2">FAQs</h3>
                    <ul className="space-y-2 text-cyan-200/70">
                      <li>• How do I track my order?</li>
                      <li>• What is your return policy?</li>
                      <li>• How do I change my password?</li>
                      <li>• How do I update my shipping address?</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-cyan-500/10 rounded-xl ring-1 ring-cyan-400/20">
                    <h3 className="text-lg font-semibold text-cyan-100 mb-2">Documentation</h3>
                    <p className="text-cyan-200/70">
                      Visit our help center for detailed guides and tutorials.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Replies Tab - For all users */}
            {activeTab === 'replies' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-cyan-100">My Replies</h2>
                <p className="text-cyan-200/70">Replies to your comments and reviews</p>

                <div className="space-y-4">
                  <div className="p-6 bg-cyan-500/10 rounded-xl ring-1 ring-cyan-400/20">
                    <p className="text-cyan-200/70 text-center py-8">No replies yet. Your comment replies will appear here.</p>
                  </div>
                </div>
              </motion.div>
            )}



            {/* Admin: Account Control / Freeze Tab */}
            {activeTab === 'freeze' && isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-purple-300">Account Control</h2>
                <p className="text-purple-200/70">Freeze website access temporarily</p>

                <div className="space-y-4">
                  <div className="p-6 bg-red-500/10 rounded-xl ring-1 ring-red-400/20">
                    <h3 className="text-lg font-semibold text-red-100 mb-4">Website Freeze Controls</h3>
                    
                    <div className="space-y-4">
                      {/* Current Status */}
                      {isFrozen && (
                        <div className="p-4 bg-red-500/20 rounded-lg border border-red-400/30">
                          <p className="text-red-200 font-semibold">⚠️ Website is currently FROZEN</p>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-red-200/80 mb-2">Maintenance Message</label>
                        <textarea
                          value={freezeMessage}
                          onChange={(e) => setFreezeMessage(e.target.value)}
                          disabled={isFrozen}
                          className="w-full px-4 py-3 bg-black/30 border border-red-400/20 rounded-xl text-red-100 placeholder-red-200/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50"
                          placeholder="Enter message to display to users..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-red-200/80 mb-2">Freeze Duration (optional)</label>
                        <select 
                          value={freezeDuration}
                          onChange={(e) => setFreezeDuration(e.target.value)}
                          disabled={isFrozen}
                          className="w-full px-4 py-3 bg-black/30 border border-red-400/20 rounded-xl text-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50"
                        >
                          <option value="">Until manually unfrozen</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                          <option value="360">6 hours</option>
                          <option value="720">12 hours</option>
                          <option value="1440">24 hours</option>
                        </select>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button 
                          onClick={handleFreezeWebsite}
                          disabled={isFrozen || freezeLoading}
                          className="flex-1 px-6 py-3 bg-red-500/20 text-red-300 rounded-xl font-semibold hover:bg-red-500/30 ring-1 ring-red-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {freezeLoading ? 'Processing...' : 'Freeze Website'}
                        </button>
                        <button 
                          onClick={handleUnfreezeWebsite}
                          disabled={!isFrozen || freezeLoading}
                          className="flex-1 px-6 py-3 bg-green-500/20 text-green-300 rounded-xl font-semibold hover:bg-green-500/30 ring-1 ring-green-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {freezeLoading ? 'Processing...' : 'Unfreeze Website'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </main>
        </div>
      </div>

      {/* Guest Restriction Modal */}
      <GuestRestrictionModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        action="view your profile"
      />
    </div>
  )
}
