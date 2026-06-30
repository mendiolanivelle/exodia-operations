import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg text-[#3E4048]">Loading...</div>
  }

  if (!user) {
    const params = new URLSearchParams(window.location.search)
    const trackingId = params.get('tracking_id')
    if (trackingId) {
      sessionStorage.setItem('prt_tracking_id', trackingId)
    }
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
