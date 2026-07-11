import { Link } from 'react-router-dom'
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
            <div className="text-sm font-extrabold tracking-tight text-slate-900">Sarkora</div>
            <div className="mt-1 text-sm text-slate-600">
              Discover eligible exams, track deadlines, and never miss an application window.
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
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
          </div>
        </div>
        <div className="mt-8 text-xs text-slate-500">
          © {new Date().getFullYear()} Sarkora. Not affiliated with any government body.
        </div>
      </Container>
    </footer>
  )
}

