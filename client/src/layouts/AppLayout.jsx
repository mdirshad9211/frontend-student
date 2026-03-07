import { Outlet } from 'react-router-dom'
import { AppNavbar } from '../components/AppNavbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppNavbar />
      <main className="py-8">
        <Outlet />
      </main>
    </div>
  )
}

