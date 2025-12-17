import { ArrowLeft, Edit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function TermsPage() {
  const navigate = useNavigate()
  const [isAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true'
  })

  const handleEditClick = () => {
    navigate('/admin', { state: { openModal: 'edit-pages' } })
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
        <div className="mx-auto mt-8 max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4 text-cyan-400">Terms & Conditions</h1>
          <p className="text-lg text-cyan-100/80">By using Ecom, you agree to our terms and conditions. Please review our policies regarding privacy, returns, and user conduct. For questions, contact our support team.</p>
        </div>
      </div>
    </section>
  );
}
