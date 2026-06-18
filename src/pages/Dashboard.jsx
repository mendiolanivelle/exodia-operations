import { useAuth } from '../lib/AuthContext'
import './Dashboard.css'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Exodia Operations Portal</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome to Operations</h2>
          <p>You are now logged in. This is your operations dashboard.</p>
        </div>

        <div className="cards-grid">
          <div className="card">
            <h3>Active Projects</h3>
            <p className="card-number">0</p>
          </div>
          <div className="card">
            <h3>Pending Tasks</h3>
            <p className="card-number">0</p>
          </div>
          <div className="card">
            <h3>Team Members</h3>
            <p className="card-number">0</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
