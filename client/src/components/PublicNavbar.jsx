import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Landmark, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react'
import { Container } from './Container'
import { useAuth } from '../store/authStore'

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold transition ${
    isActive ? 'text-emerald-700' : 'text-gray-700 hover:text-gray-900'
  }`

export function PublicNavbar() {
  const { isAuthed, isAdmin, logout, bootstrapped, user } = useAuth()
  const navigate = useNavigate()

  const showAuthed = bootstrapped && isAuthed
  const homeHref = showAuthed ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'

  return (
    <div className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
      <Container className="flex items-center justify-between py-3">
        <Link to={homeHref} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
            <Landmark size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight text-gray-900">Exam Tracker</div>
            <div className="text-xs text-gray-500">
              {showAuthed ? `Welcome, ${user?.name || 'User'}` : 'Government Exam MVP'}
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
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
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-100 shadow-sm hover:bg-gray-800 transition"
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
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-sm"
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
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-sm"
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

