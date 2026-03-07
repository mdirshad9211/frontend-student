import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Landmark, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react'
import { Container } from './Container'
import { useAuth } from '../store/authStore'

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
  }`

export function PublicNavbar() {
  const { isAuthed, isAdmin, logout, bootstrapped, user } = useAuth()
  const navigate = useNavigate()

  const showAuthed = bootstrapped && isAuthed
  const homeHref = showAuthed ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'

  return (
    <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
      <Container className="flex items-center justify-between gap-4 py-3">
        <Link to={homeHref} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Landmark size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight text-slate-900">Exam Tracker</div>
            <div className="text-xs text-slate-500">
              {showAuthed ? `Welcome, ${user?.name || 'User'}` : 'Government Exam MVP'}
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <NavLink className={navLinkClass} to="/exams">
            Exams
          </NavLink>
          {showAuthed ? (
            <>
              <NavLink className={navLinkClass} to={isAdmin ? '/admin/dashboard' : '/dashboard'}>
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className={navLinkClass} to="/login">
                Login
              </NavLink>
              <NavLink className={navLinkClass} to="/register">
                Register
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {showAuthed ? (
            <>
              <Link
                to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-100 shadow-sm"
              >
                <LayoutDashboard size={16} />
                Dash
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-400 shadow-sm"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-100 shadow-sm"
              >
                <LogIn size={16} /> Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-400 shadow-sm"
              >
                <UserPlus size={16} /> Join
              </Link>
            </>
          )}
        </div>
      </Container>
    </div>
  )
}

