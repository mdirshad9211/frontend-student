import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LogIn, UserPlus, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import logo from '../assets/logo.jpeg'
import { Container } from './Container'
import { useAuth } from '../store/authStore'
import { STATE_OPTIONS, getSelectedState, setSelectedState } from '../utils/stateFilter'

const navLinkClass = ({ isActive }) => 'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ' + (isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900')

export function PublicNavbar() {
  const { isAuthed, isAdmin, logout, bootstrapped, user } = useAuth()
  const navigate = useNavigate()
  const [selectedState, setSelectedStateLocal] = useState('all')
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => setSelectedStateLocal(getSelectedState()), [])

  const showAuthed = bootstrapped && isAuthed
  const homeHref = showAuthed ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'
  const closeMenu = () => setMenuOpen(false)
  function onStateChange(nextState) {
    setSelectedState(nextState); setSelectedStateLocal(nextState); closeMenu()
    navigate(nextState === 'all' ? '/exams' : '/exams?state=' + encodeURIComponent(nextState))
  }
  function handleLogout() { logout(); closeMenu(); navigate('/') }

  return <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
    <Container className="flex items-center justify-between gap-3 py-3">
      <Link to={homeHref} className="flex min-w-0 items-center gap-2">
        <img src={logo} alt="Sarkora" className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm" />
        <div className="min-w-0"><div className="text-sm font-extrabold tracking-tight text-slate-900">Sarkora</div><div className="truncate text-xs text-slate-500">{showAuthed ? 'Welcome, ' + (user?.name || 'User') : 'Government exam updates'}</div></div>
      </Link>
      <nav className="hidden items-center gap-2 lg:flex">
        <NavLink className={navLinkClass} to="/exams">Exams</NavLink><NavLink className={navLinkClass} to="/results">Results</NavLink><NavLink className={navLinkClass} to="/admit-cards">Admit Cards</NavLink>
        <select value={selectedState} onChange={(e) => onStateChange(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" aria-label="Select state"><option value="all">All states</option>{STATE_OPTIONS.map((state) => <option key={state} value={state}>{state}</option>)}</select>
        {showAuthed ? <><NavLink className={navLinkClass} to={isAdmin ? '/admin/dashboard' : '/dashboard'}><LayoutDashboard size={16} /> Dashboard</NavLink><button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white"><LogOut size={16} /> Logout</button></> : <><NavLink className={navLinkClass} to="/login">Login</NavLink><NavLink className={navLinkClass} to="/register">Register</NavLink></>}
      </nav>
      <button type="button" onClick={() => setMenuOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
    </Container>
    {menuOpen && <div className="border-t border-slate-100 bg-white lg:hidden"><Container className="space-y-3 py-4">
      <nav className="grid grid-cols-2 gap-2"><NavLink onClick={closeMenu} className={navLinkClass} to="/exams">Exams</NavLink><NavLink onClick={closeMenu} className={navLinkClass} to="/results">Results</NavLink><NavLink onClick={closeMenu} className={navLinkClass} to="/admit-cards">Admit Cards</NavLink>{showAuthed && <NavLink onClick={closeMenu} className={navLinkClass} to={isAdmin ? '/admin/dashboard' : '/dashboard'}><LayoutDashboard size={16} /> Dashboard</NavLink>}</nav>
      <select value={selectedState} onChange={(e) => onStateChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700" aria-label="Select state"><option value="all">All states</option>{STATE_OPTIONS.map((state) => <option key={state} value={state}>{state}</option>)}</select>
      {showAuthed ? <button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white"><LogOut size={16} /> Logout</button> : <div className="grid grid-cols-2 gap-2"><Link onClick={closeMenu} to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white"><LogIn size={16} /> Login</Link><Link onClick={closeMenu} to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white"><UserPlus size={16} /> Join</Link></div>}
    </Container></div>}
  </header>
}
