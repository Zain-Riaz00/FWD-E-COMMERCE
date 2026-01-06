import { ArrowLeft, Edit, Send, CheckCircle, Mail, Phone, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { feedbackAPI } from '@/services/api'

export default function ContactPage() {
  const navigate = useNavigate()
  const [isAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true'
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    type: 'feedback' as 'contact' | 'feedback' | 'complaint' | 'suggestion',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleEditClick = () => {
    navigate('/admin', { state: { openModal: 'edit-pages' } })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Get user ID from localStorage
      let userId: string | undefined
      const userJson = localStorage.getItem('user')
      if (userJson) {
        try {
          const user = JSON.parse(userJson)
          userId = user._id
        } catch (e) {
          console.error('Failed to parse user data:', e)
        }
      }
      
      const result = await feedbackAPI.submit({
        userName: formData.name,
        userEmail: formData.email,
        type: formData.type,
        subject: formData.subject,
        message: formData.message,
        userId
      })
      
      if (result) {
        setIsSubmitted(true)
        setFormData({ name: '', email: '', subject: '', type: 'feedback', message: '' })
      } else {
        setError('Failed to submit. Please try again.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className="pb-16"
      style={{ paddingTop: 'var(--navbar-offset, 8rem)' }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur transition hover:border-cyan-300/70 hover:bg-cyan-500/10"
          >
            <ArrowLeft className="h-4 w-4 text-cyan-200 transition group-hover:text-cyan-100" />
            Back
          </button>
          {isAdmin && (
            <button
              onClick={handleEditClick}
              className="group inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-white/5 px-4 py-2 text-sm font-semibold text-purple-100 backdrop-blur transition hover:border-purple-300/70 hover:bg-purple-500/10"
            >
              <Edit className="h-4 w-4 text-purple-200 transition group-hover:text-purple-100" />
              Edit Page
            </button>
          )}
        </div>
        
        <div className="mx-auto mt-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Contact Us</h1>
            <p className="text-lg text-cyan-100/80">We'd love to hear from you! Send us a message and we'll respond as soon as possible.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-cyan-400/20"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Email</p>
                    <a href="mailto:support@ecom.com" className="text-cyan-300 hover:text-cyan-100 transition-colors">
                      support@ecom.com
                    </a>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-cyan-400/20"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Phone</p>
                    <a href="tel:+1234567890" className="text-cyan-300 hover:text-cyan-100 transition-colors">
                      +1 234 567 890
                    </a>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-cyan-400/20"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Address</p>
                    <p className="text-cyan-300">123 Commerce Street, Tech City</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 backdrop-blur-xl bg-white/5 p-8 rounded-2xl border border-cyan-400/20"
            >
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-white/60 mb-6">Thank you for contacting us. We'll get back to you soon.</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-black/30 border border-cyan-400/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-black/30 border border-cyan-400/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Subject</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="What's this about?"
                        className="w-full px-4 py-3 bg-black/30 border border-cyan-400/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-4 py-3 bg-black/30 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="feedback">General Feedback</option>
                        <option value="contact">Contact / Question</option>
                        <option value="suggestion">Suggestion</option>
                        <option value="complaint">Complaint</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Message *</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Your message..."
                      rows={5}
                      className="w-full px-4 py-3 bg-black/30 border border-cyan-400/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-400/30 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
