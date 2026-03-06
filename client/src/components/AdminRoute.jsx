import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/authStore'

export function AdminRoute({ children }) {
  const { isAuthed, isAdmin, bootstrapped } = useAuth()
  const location = useLocation()

  if (!bootstrapped) return null
  if (!isAuthed) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

