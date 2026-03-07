import { Outlet } from 'react-router-dom'
import { PublicNavbar } from '../components/PublicNavbar'
import { Footer } from '../components/Footer'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PublicNavbar />
      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

