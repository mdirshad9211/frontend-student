import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, CalendarClock } from 'lucide-react'

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
  }`

export function AdminSidebar() {
  return (
    <div className="w-full md:w-64 shrink-0">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 p-3">
        <div className="px-3 py-2 text-xs font-semibold tracking-wide text-gray-500">ADMIN</div>
        <nav className="flex flex-col gap-1">
          <NavLink className={linkClass} to="/admin/dashboard">
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink className={linkClass} to="/admin/exams">
            <FileText size={16} /> Exams
          </NavLink>
          <NavLink className={linkClass} to="/admin/exam-cycles">
            <CalendarClock size={16} /> Exam Cycles
          </NavLink>
          <NavLink className={linkClass} to="/admin/users">
            <Users size={16} /> Users
          </NavLink>
        </nav>
      </div>
    </div>
  )
}

