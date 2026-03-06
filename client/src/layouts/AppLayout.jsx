import { Outlet } from 'react-router-dom'
import { AppNavbar } from '../components/AppNavbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <AppNavbar />
      <main className="py-8">
        <Outlet />
      </main>
    </div>
  )
}

