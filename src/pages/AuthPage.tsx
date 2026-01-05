import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Shield, Sparkles, Zap, Fingerprint } from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { setGuestUser } from '@/utils/guestUser'

type FormType = 'login' | 'signup' | 'admin'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login: adminLogin, logout: adminLogout } = useAdmin()
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const isReturningUser = localStorage.getItem('hasVisitedAuth') === 'true'
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  // Set visited flag only once
  useEffect(() => {
    if (!localStorage.getItem('hasVisitedAuth')) {
      localStorage.setItem('hasVisitedAuth', 'true')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForm) return

    // Clear previous messages
    setErrorMessage('')
    setSuccessMessage('')

    // Validation
    if (!formData.email || !formData.password) {
      setErrorMessage('Please fill in all required fields')
      return
    }

    if (selectedForm === 'signup') {
      if (!formData.name) {
        setErrorMessage('Please enter your name')
        return
      }
      if (formData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Passwords do not match')
        return
      }
    }

    setIsLoading(true)

    try {
      if (selectedForm === 'signup') {
        // Sign up
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            isAdmin: false
          })
        })

        const data = await response.json()

        if (!response.ok) {
          setErrorMessage(data.message || 'Failed to create account')
          setIsLoading(false)
          return
        }

        setSuccessMessage('Account created successfully! Redirecting...')
        
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          isAdmin: false
        }))

        adminLogout()

        // Redirect immediately - no slow splash
        navigate('/')

      } else {
        // Login (regular or admin)
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            isAdminLogin: selectedForm === 'admin'
          })
        })

        const data = await response.json()

        if (!response.ok) {
          setErrorMessage(data.message || 'Login failed')
          setIsLoading(false)
          return
        }

        setSuccessMessage('Login successful! Redirecting...')

        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
          isPermanentAdmin: data.isPermanentAdmin
        }))

        // Set admin context if admin login
        if (selectedForm === 'admin' && data.isAdmin) {
          adminLogin()
        } else {
          adminLogout()
        }

        // Redirect immediately - no slow splash
        navigate('/')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setErrorMessage('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  const handleForgotPassword = () => {
    setShowForgotPassword(true)
  }

  const handleSkip = () => {
    // Clear any existing admin state before entering guest mode
    adminLogout()
    setGuestUser()
    navigate('/')
  }

  const getFormConfig = (type: FormType) => {
    const configs = {
      login: {
        title: 'Log In',
        subtitle: 'Welcome back! Please enter your credentials',
        icon: Lock,
        gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
        buttonGradient: 'from-cyan-600 to-blue-600',
        ringColor: 'ring-cyan-400/30',
        glowColor: 'shadow-cyan-500/25',
        focusRing: 'focus:ring-cyan-500/50 focus:border-cyan-500'
      },
      signup: {
        title: 'Sign Up',
        subtitle: 'Create your account to get started',
        icon: User,
        gradient: 'from-green-500 via-teal-500 to-emerald-600',
        buttonGradient: 'from-green-600 to-teal-600',
        ringColor: 'ring-green-400/30',
        glowColor: 'shadow-green-500/25',
        focusRing: 'focus:ring-green-500/50 focus:border-green-500'
      },
      admin: {
        title: 'ADMIN',
        subtitle: 'Administrator access portal',
        icon: Shield,
        gradient: 'from-purple-500 via-pink-500 to-rose-600',
        buttonGradient: 'from-purple-600 to-pink-600',
        ringColor: 'ring-purple-400/30',
        glowColor: 'shadow-purple-500/25',
        focusRing: 'focus:ring-purple-500/50 focus:border-purple-500'
      }
    }
    return configs[type]
  }

  const handleCardClick = (type: FormType) => {
    setSelectedForm(type)
    setIsExpanded(false)
  }

  const config = selectedForm ? getFormConfig(selectedForm) : null
  const Icon = config ? config.icon : Lock

  return (
    <>
      <ThemeToggle className="fixed top-8 right-8 z-50" />
      <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Minimal Static Background Ambiance */}
      {/* Static Gradient Orbs - No Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-cyan-500/15 via-blue-500/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/15 via-pink-500/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 left-1/3 w-1/2 h-1/2 bg-gradient-to-tr from-green-500/10 via-teal-500/6 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, cyan 1px, transparent 1px),
            linear-gradient(to bottom, cyan 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Sidebar Buttons - CSS-only transitions for 120fps */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
        {/* Login Button */}
        <button
          onClick={() => handleCardClick('login')}
          className={`group relative w-16 h-16 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 
            hover:bg-white/20 hover:scale-105 hover:translate-x-1 active:scale-95 transition-all duration-150
            ${selectedForm === 'login' ? 'ring-2 ring-cyan-400 bg-white/20 shadow-lg shadow-cyan-500/50' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
          <Lock className="w-7 h-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-100 drop-shadow-lg" />
          {selectedForm === 'login' && <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-cyan-400 rounded-full blur-sm animate-pulse" />}
          <span className="absolute top-1/2 left-[calc(100%+0.75rem)] transform -translate-y-1/2 text-sm text-white bg-cyan-600/80 backdrop-blur-xl px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none shadow-lg shadow-cyan-500/50 ring-1 ring-white/20 z-50">Login</span>
        </button>

        {/* Sign Up Button */}
        <button
          onClick={() => handleCardClick('signup')}
          className={`group relative w-16 h-16 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 
            hover:bg-white/20 hover:scale-105 hover:translate-x-1 active:scale-95 transition-all duration-150
            ${selectedForm === 'signup' ? 'ring-2 ring-green-400 bg-white/20 shadow-lg shadow-green-500/50' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
          <User className="w-7 h-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-100 drop-shadow-lg" />
          {selectedForm === 'signup' && <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-green-400 rounded-full blur-sm animate-pulse" />}
          <span className="absolute top-1/2 left-[calc(100%+0.75rem)] transform -translate-y-1/2 text-sm text-white bg-green-600/80 backdrop-blur-xl px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none shadow-lg shadow-green-500/50 ring-1 ring-white/20 z-50">Sign Up</span>
        </button>

        {/* Admin Button */}
        <button
          onClick={() => handleCardClick('admin')}
          className={`group relative w-16 h-16 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 
            hover:bg-white/20 hover:scale-105 hover:translate-x-1 active:scale-95 transition-all duration-150
            ${selectedForm === 'admin' ? 'ring-2 ring-purple-400 bg-white/20 shadow-lg shadow-purple-500/50' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
          <Shield className="w-7 h-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-100 drop-shadow-lg" />
          {selectedForm === 'admin' && <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-purple-400 rounded-full blur-sm animate-pulse" />}
          <span className="absolute top-1/2 left-[calc(100%+0.75rem)] transform -translate-y-1/2 text-sm text-white bg-purple-600/80 backdrop-blur-xl px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none shadow-lg shadow-purple-500/50 ring-1 ring-white/20 z-50">Admin</span>
        </button>
      </div>

      {/* CENTER WELCOME MESSAGE - When No Form Selected */}
      <AnimatePresence mode="wait">
        {!selectedForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-center max-w-3xl"
          >
            <div className="mb-8 inline-block">
              <div className="relative">
                <Sparkles className="w-32 h-32 text-cyan-400 drop-shadow-2xl" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg animate-fade-in">
              {isReturningUser ? 'Welcome Back' : 'Welcome to Ecom'}
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-12 font-light animate-fade-in" style={{ animationDelay: '100ms' }}>
              {isReturningUser 
                ? 'Choose your authentication method from the sidebar'
                : 'Get started by creating your account or signing in'}
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-cyan-400/30 transition-all group">
                <Zap className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
                <p className="text-white/60 text-sm">Optimized for 60+ FPS smooth animations</p>
              </div>

              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-green-400/30 transition-all group">
                <Fingerprint className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-semibold mb-2">Secure Access</h3>
                <p className="text-white/60 text-sm">Enterprise-grade authentication system</p>
              </div>

              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-all group">
                <Sparkles className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-semibold mb-2">Premium Design</h3>
                <p className="text-white/60 text-sm">Beautiful UI crafted with attention to detail</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => setShowForgotPassword(false)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-scale-in">
              <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl ring-1 ring-white/20 dark:ring-black/20 border border-white/10 dark:border-black/20">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Reset Password</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Enter your email to receive an OTP</p>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const emailInput = (e.target as HTMLFormElement).email as HTMLInputElement;
                    const email = emailInput.value;
                    
                    setIsLoading(true);
                    try {
                      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                      });

                      if (!response.ok) {
                        const data = await response.json();
                        setErrorMessage(data.message || 'Failed to send OTP.');
                        setIsLoading(false);
                        return;
                      }

                      setSuccessMessage('OTP sent successfully! Check your email.');
                      setShowForgotPassword(false);
                    } catch (error) {
                      console.error('Error sending OTP:', error);
                      setErrorMessage('Network error. Please try again.');
                    }
                    setIsLoading(false);
                  }} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-white/40 dark:bg-black/30 border border-white/10 dark:border-black/20 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Center Card */}
      <AnimatePresence mode="wait">
        {selectedForm && config && (
          <motion.div
            key={selectedForm}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative z-20"
          >
            <motion.div
              initial={false}
              animate={{
                width: isExpanded ? '600px' : '320px',
                height: isExpanded ? 'auto' : '200px',
              }}
              transition={{ 
                duration: 0.5, 
                ease: [0.25, 0.1, 0.25, 1]
              }}
              onMouseEnter={() => setIsExpanded(true)}
              onMouseLeave={(e) => {
                // Only close if not hovering over form elements or autocomplete dropdown
                const relatedTarget = e.relatedTarget as HTMLElement | null
                if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
                  return
                }
                setIsExpanded(false)
              }}
              className={`relative backdrop-blur-xl bg-transparent border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl 
                ${config.glowColor} ring-1 ${config.ringColor}
                overflow-hidden cursor-pointer`}
              style={{ 
                willChange: 'width, height',
                backfaceVisibility: 'hidden',
                perspective: 1000,
                transform: 'translateZ(0)'
              }}
            >
              {/* Animated Neon Border Effect */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                {/* Running Light Effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `conic-gradient(from 0deg at 50% 50%, 
                      transparent 0deg,
                      ${selectedForm === 'login' ? 'rgba(6, 182, 212, 0.6)' : 
                        selectedForm === 'signup' ? 'rgba(16, 185, 129, 0.6)' : 
                        'rgba(168, 85, 247, 0.6)'} 30deg,
                      ${selectedForm === 'login' ? 'rgba(59, 130, 246, 0.8)' : 
                        selectedForm === 'signup' ? 'rgba(20, 184, 166, 0.8)' : 
                        'rgba(236, 72, 153, 0.8)'} 60deg,
                      ${selectedForm === 'login' ? 'rgba(6, 182, 212, 0.6)' : 
                        selectedForm === 'signup' ? 'rgba(16, 185, 129, 0.6)' : 
                        'rgba(168, 85, 247, 0.6)'} 90deg,
                      transparent 120deg,
                      transparent 360deg
                    )`,
                    maskImage: 'linear-gradient(transparent calc(100% - 3px), black calc(100% - 3px), black 100%, transparent 100%), linear-gradient(to right, transparent calc(100% - 3px), black calc(100% - 3px), black 100%, transparent 100%), linear-gradient(transparent 0%, black 0%, black 3px, transparent 3px), linear-gradient(to right, transparent 0%, black 0%, black 3px, transparent 3px)',
                    maskComposite: 'exclude',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                />
                
                {/* Pulsating Glow Border */}
                <motion.div
                  className={`absolute inset-0 rounded-3xl`}
                  style={{
                    boxShadow: `inset 0 0 20px ${
                      selectedForm === 'login' ? 'rgba(6, 182, 212, 0.4)' :
                      selectedForm === 'signup' ? 'rgba(16, 185, 129, 0.4)' :
                      'rgba(168, 85, 247, 0.4)'
                    }, 0 0 30px ${
                      selectedForm === 'login' ? 'rgba(6, 182, 212, 0.3)' :
                      selectedForm === 'signup' ? 'rgba(16, 185, 129, 0.3)' :
                      'rgba(168, 85, 247, 0.3)'
                    }`
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Corner Light Sparks */}
                {[0, 90, 180, 270].map((rotation, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${
                        selectedForm === 'login' ? '#06b6d4' :
                        selectedForm === 'signup' ? '#10b981' :
                        '#a855f7'
                      }, transparent)`,
                      top: rotation === 0 || rotation === 90 ? '0' : 'auto',
                      bottom: rotation === 180 || rotation === 270 ? '0' : 'auto',
                      left: rotation === 0 || rotation === 270 ? '0' : 'auto',
                      right: rotation === 90 || rotation === 180 ? '0' : 'auto',
                      filter: 'blur(2px)',
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5 pointer-events-none`} />
              
              {/* Shimmer Effect - REMOVED for performance */}
              
              {/* Collapsed View */}
              <AnimatePresence mode="wait">
                {!isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} 
                        flex items-center justify-center mb-4 shadow-xl ${config.glowColor}`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className={`text-3xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-2`}>
                      {config.title}
                    </h2>
                    <p className="text-sm text-gray-500 text-center flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Hover to expand
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expanded Form View */}
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeIn" }}
                    className="p-8"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{config.title}</h2>
                        <p className="text-sm text-gray-500">{config.subtitle}</p>
                      </div>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                      >
                        {errorMessage}
                      </motion.div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
                      >
                        {successMessage}
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Sign Up - Name Field */}
                      {selectedForm === 'signup' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-3 py-2.5 bg-white/40 dark:bg-black/30 border border-white/10 dark:border-black/20 rounded-lg text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${config.focusRing} transition-all backdrop-blur-sm`}
                              placeholder="Zain Riaz"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Email Field */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-3 py-2.5 bg-white/40 dark:bg-black/30 border border-white/10 dark:border-black/20 rounded-lg text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${config.focusRing} transition-all backdrop-blur-sm`}
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-3 py-2.5 bg-white/40 dark:bg-black/30 border border-white/10 dark:border-black/20 rounded-lg text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${config.focusRing} transition-all backdrop-blur-sm`}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      {/* Confirm Password - Sign Up Only */}
                      {selectedForm === 'signup' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-3 py-2.5 bg-white/40 dark:bg-black/30 border border-white/10 dark:border-black/20 rounded-lg text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${config.focusRing} transition-all backdrop-blur-sm`}
                              placeholder="••••••••"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Remember Me & Forgot Password - Login and Admin */}
                      {(selectedForm === 'login' || selectedForm === 'admin') && (
                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center cursor-pointer group">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500/50 transition-all" />
                            <span className="ml-2 text-xs text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
                          </label>
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className={`text-xs font-medium bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent hover:opacity-80 transition-opacity pointer-events-auto cursor-pointer`}
                          >
                            Forgot password?
                          </button>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-gradient-to-r ${config.buttonGradient} text-white py-3 rounded-xl font-semibold text-sm hover:shadow-xl ${config.glowColor} transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          <>
                            {selectedForm === 'login' && 'Sign In'}
                            {selectedForm === 'signup' && 'Create Account'}
                            {selectedForm === 'admin' && 'Admin Login'}
                          </>
                        )}
                      </button>

                      {/* Skip for Now Button */}
                      {(selectedForm === 'login' || selectedForm === 'signup') && (
                        <button
                          type="button"
                          onClick={handleSkip}
                          className="w-full mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors underline"
                        >
                          Skip for now
                        </button>
                      )}
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  )
}
