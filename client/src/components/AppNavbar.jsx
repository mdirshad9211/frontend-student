import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, User } from 'lucide-react'
import { Container } from './Container'
import { useAuth } from '../store/authStore'

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-indigo-50 text-indigo-800' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
  }`

export function AppNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
      <Container className="flex items-center justify-between py-3">
        <Link to="/dashboard" className="text-sm font-extrabold tracking-tight text-gray-900">
          Exam Tracker
        </Link>

        <div className="flex items-center gap-2">
          <NavLink className={navLinkClass} to="/dashboard">
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink className={navLinkClass} to="/profile">
            <User size={16} />
            Profile
          </NavLink>

          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-100 shadow-sm hover:bg-gray-800 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="hidden text-sm text-gray-600 md:block">
          Signed in as <span className="font-semibold text-gray-900">{user?.name || 'User'}</span>
        </div>
      </Container>
    </div>
  )
}

