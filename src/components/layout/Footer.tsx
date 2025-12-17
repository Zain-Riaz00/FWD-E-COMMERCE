import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0a0e1a] via-[#050E25] to-[#091735] text-cyan-100/90 border-t border-cyan-400/10 shadow-inner">
      <div className="flicker-divider" />
      <div className="container flex flex-col md:flex-row items-center justify-between gap-6 py-10">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-lg font-bold tracking-wider text-cyan-300 mb-1">Ecom</p>
          <p className="text-xs text-cyan-100/60">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-base font-medium">
          <Link to="/about" className="footer-link">About Us</Link>
          <Link to="/contact" className="footer-link">Contact Us</Link>
          <Link to="/help" className="footer-link">Help Center</Link>
          <Link to="/terms" className="footer-link">Terms &amp; Conditions</Link>
        </nav>
      </div>
      <style>{`
        .footer-link {
          @apply text-cyan-200 hover:text-cyan-400 transition-colors duration-200 underline-offset-4 decoration-cyan-400 hover:underline;
        }
      `}</style>
    </footer>
  )
}
