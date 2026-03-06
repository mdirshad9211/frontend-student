import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/authStore'

export function ProtectedRoute({ children }) {
  const { isAuthed, bootstrapped } = useAuth()
  const location = useLocation()

  if (!bootstrapped) return null
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

