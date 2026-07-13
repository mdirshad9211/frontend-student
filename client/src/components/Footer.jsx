import { Link } from 'react-router-dom'
import { Instagram, Send } from 'lucide-react'
import logo from '../assets/logo.jpeg'
import { Container } from './Container'
import { useAuth } from '../store/authStore'

export function Footer() {
  const { isAuthed, isAdmin } = useAuth()
  const dashboardHref = isAdmin ? '/admin/dashboard' : '/dashboard'

  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-slate-900"><img src={logo} alt="Sarkora" className="h-24 w-24 rounded-xl object-cover shadow-sm" /></div>
            <div className="mt-1 text-sm text-slate-600">
              Discover eligible exams, track deadlines, and never miss an application window.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <Link className="text-slate-600 hover:text-indigo-600" to="/exams">
              Exams
            </Link>
            {isAuthed ? (
              <Link className="text-slate-600 hover:text-indigo-600" to={dashboardHref}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="text-slate-600 hover:text-indigo-600" to="/login">
                  Login
                </Link>
                <Link className="text-slate-600 hover:text-indigo-600" to="/register">
                  Register
                </Link>
              </>
            )}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <a href="https://www.instagram.com/sarkora_official/" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"><Instagram size={19} /></a>
              <a href="https://t.me/sarkora_official" target="_blank" rel="noreferrer" aria-label="Telegram" title="Telegram" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"><Send size={19} /></a>
            </div>
          </div>
        </div>
        <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
          <Link to="/about" className="hover:text-indigo-600">About us</Link>
          <Link to="/contact" className="hover:text-indigo-600">Contact</Link>
          <Link to="/careers" className="hover:text-indigo-600">Careers</Link>
          <Link to="/privacy" className="hover:text-indigo-600">Privacy policy</Link>
          <Link to="/terms" className="hover:text-indigo-600">Terms of use</Link>
          <Link to="/disclaimer" className="hover:text-indigo-600">Disclaimer</Link>
        </nav>
        <div className="mt-8 text-xs text-slate-500">
          � {new Date().getFullYear()} Sarkora. Not affiliated with any government body.
        </div>
      </Container>
    </footer>
  )
}





