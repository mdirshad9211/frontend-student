import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Container } from '../components/Container'
import { AdminSidebar } from '../components/AdminSidebar'
import { useAuth } from '../store/authStore'

export function AdminLayout({ showNav = false }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur">
        <Container className="flex items-center justify-between py-3">
          <Link to="/admin/dashboard" className="text-sm font-extrabold tracking-tight text-gray-900">
            Admin · Exam Tracker
          </Link>
          {showNav ? (
            <button
              className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-100 shadow-sm hover:bg-gray-800 transition"
              onClick={() => {
                logout()
                navigate('/admin/login')
              }}
            >
              Logout
            </button>
          ) : null}
        </Container>
      </div>

      {showNav ? (
        <Container className="py-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <AdminSidebar />
            <div className="flex-1">
              <Outlet />
            </div>
          </div>
        </Container>
      ) : (
        <main className="py-10">
          <Container>
            <Outlet />
          </Container>
        </main>
      )}
    </div>
  )
}

