import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg text-[#3E4048]">Loading...</div>
  }

  if (!user) {
    return <Navigate to={`/login${location.search}`} replace />
  }

  return children
}

export default ProtectedRoute
