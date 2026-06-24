import { useState } from 'react'
import { useAuth } from '../lib/useAuth'

function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-[#CACDD7]/20">
      <header className="bg-[#1B1A1C] px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png?v=2" alt="Exodia" className="h-10 w-auto" />
          <span className="text-white text-xl font-bold tracking-wide">Exodia Operations Portal</span>
        </div>

        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'players'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            Players
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-[#CACDD7] text-sm">{user?.email}</span>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="px-10 py-10 max-w-6xl mx-auto">
        {activeTab === 'dashboard' && (
          <>
            <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
              <h2 className="text-[#1B1A1C] text-xl font-semibold mb-2">Welcome to Operations</h2>
              <p className="text-[#3E4048]">You are now logged in. This is your operations dashboard.</p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
              <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <h3 className="text-[#3E4048] text-base font-medium mb-4">Active Projects</h3>
                <p className="text-[#FF5900] text-5xl font-bold">0</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <h3 className="text-[#3E4048] text-base font-medium mb-4">Pending Tasks</h3>
                <p className="text-[#FF5900] text-5xl font-bold">0</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <h3 className="text-[#3E4048] text-base font-medium mb-4">Team Members</h3>
                <p className="text-[#FF5900] text-5xl font-bold">0</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'players' && (
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Players</h2>
            <p className="text-[#3E4048]">Player management coming soon.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard