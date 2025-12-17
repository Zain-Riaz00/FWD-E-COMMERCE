import { useState, useEffect } from 'react'
import { X, Save, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

interface PageContentEditorProps {
  isOpen: boolean
  onClose: () => void
}

interface PageContent {
  helpPage: {
    title: string
    description: string
  }
  termsPage: {
    title: string
    content: string
  }
  aboutPage: {
    title: string
    content: string
  }
  contactPage: {
    title: string
    description: string
    email: string
    phone: string
  }
}

export default function PageContentEditor({ isOpen, onClose }: PageContentEditorProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedPage, setSelectedPage] = useState<'help' | 'terms' | 'about' | 'contact'>('help')
  const [content, setContent] = useState<PageContent>({
    helpPage: {
      title: 'Help Center',
      description: ''
    },
    termsPage: {
      title: 'Terms & Conditions',
      content: ''
    },
    aboutPage: {
      title: 'About Us',
      content: ''
    },
    contactPage: {
      title: 'Contact Us',
      description: '',
      email: '',
      phone: ''
    }
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchPageContent()
    }
  }, [isOpen])

  const fetchPageContent = async () => {
    setLoading(true)
    try {
      console.log('Fetching page content...')
      const response = await fetch('http://localhost:5000/api/admin/settings')
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Received data:', data)
      
      setContent({
        helpPage: data.helpPageContent || { title: 'Help Center', description: '' },
        termsPage: data.termsPageContent || { title: 'Terms & Conditions', content: '' },
        aboutPage: data.aboutPageContent || { title: 'About Us', content: '' },
        contactPage: data.contactPageContent || { title: 'Contact Us', description: '', email: '', phone: '' }
      })
    } catch (error) {
      console.error('Error fetching page content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const endpoints: Record<string, string> = {
        help: '/api/admin/settings/help-page',
        terms: '/api/admin/settings/terms-page',
        about: '/api/admin/settings/about-page',
        contact: '/api/admin/settings/contact-page'
      }

      const contentMap = {
        help: content.helpPage,
        terms: content.termsPage,
        about: content.aboutPage,
        contact: content.contactPage
      }

      const response = await fetch(`http://localhost:5000${endpoints[selectedPage]}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentMap[selectedPage])
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Page content updated successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to update page content' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating page content' })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  console.log('Rendering PageContentEditor modal, loading:', loading, 'content:', content)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={(e) => e.stopPropagation()}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl shadow-cyan-500/20"
      >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-400/20 bg-black/40 px-6 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Edit Page Content</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-80px)]">
            {/* Sidebar */}
            <div className="w-64 border-r border-cyan-400/20 bg-black/20 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Select Page</p>
              {['help', 'terms', 'about', 'contact'].map((page) => (
                <button
                  key={page}
                  onClick={() => setSelectedPage(page as typeof selectedPage)}
                  className={`mb-2 w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                    selectedPage === page
                      ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/40'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)} Page
                </button>
              ))}
            </div>

            {/* Content Editor */}
            <div className="flex-1 overflow-y-auto p-6">
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

              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-cyan-300">Loading...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPage === 'help' && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Title</label>
                        <input
                          type="text"
                          value={content.helpPage.title}
                          onChange={(e) => setContent({
                            ...content,
                            helpPage: { ...content.helpPage, title: e.target.value }
                          })}
                          className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Description</label>
                        <textarea
                          value={content.helpPage.description}
                          onChange={(e) => setContent({
                            ...content,
                            helpPage: { ...content.helpPage, description: e.target.value }
                          })}
                          rows={6}
                          className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        />
                      </div>
                    </>
                  )}

                  {selectedPage === 'terms' && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Title</label>
                        <input
                          type="text"
                          value={content.termsPage.title}
                          onChange={(e) => setContent({
                            ...content,
                            termsPage: { ...content.termsPage, title: e.target.value }
                          })}
                          className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Content</label>
                        <textarea
                          value={content.termsPage.content}
                          onChange={(e) => setContent({
                            ...content,
                            termsPage: { ...content.termsPage, content: e.target.value }
                          })}
                          rows={12}
                          className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        />
                      </div>
                    </>
                  )}

                  {selectedPage === 'about' && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Title</label>
                        <input
                          type="text"
                          value={content.aboutPage.title}
                          onChange={(e) => setContent({
                            ...content,
                            aboutPage: { ...content.aboutPage, title: e.target.value }
                          })}
                          className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Content</label>
                        <textarea
                          value={content.aboutPage.content}
                          onChange={(e) => setContent({
                            ...content,
                            aboutPage: { ...content.aboutPage, content: e.target.value }
                          })}
                          rows={12}
                          className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        />
                      </div>
                    </>
                  )}

                  {selectedPage === 'contact' && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Title</label>
                        <input
                          type="text"
                          value={content.contactPage.title}
                          onChange={(e) => setContent({
                            ...content,
                            contactPage: { ...content.contactPage, title: e.target.value }
                          })}
                          className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Description</label>
                        <textarea
                          value={content.contactPage.description}
                          onChange={(e) => setContent({
                            ...content,
                            contactPage: { ...content.contactPage, description: e.target.value }
                          })}
                          rows={4}
                          className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Email</label>
                        <input
                          type="email"
                          value={content.contactPage.email}
                          onChange={(e) => setContent({
                            ...content,
                            contactPage: { ...content.contactPage, email: e.target.value }
                          })}
                          className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Phone</label>
                        <input
                          type="tel"
                          value={content.contactPage.phone}
                          onChange={(e) => setContent({
                            ...content,
                            contactPage: { ...content.contactPage, phone: e.target.value }
                          })}
                          className="w-full rounded-lg border border-cyan-400/30 bg-black/30 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        />
                      </div>
                    </>
                  )}

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                  >
                    <Save className="h-5 w-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
  )
}
