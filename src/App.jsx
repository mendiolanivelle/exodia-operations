import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TicketView from './components/TicketView'

function RootRedirect() {
  const params = new URLSearchParams(window.location.search)
  const trackingId = params.get('tracking_id')
  if (trackingId) {
    return <Navigate to={`/ticket/${trackingId}`} replace />
  }
  return <Dashboard />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/ticket/:trackingId"
            element={
              <ProtectedRoute>
                <TicketView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RootRedirect />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
