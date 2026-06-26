import { useState } from 'react'
import { useAuth } from '../lib/useAuth'
import Players from '../components/Players'

const tabs = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'players', label: 'Players' },
]

function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen flex flex-col bg-[#CACDD7]/20">
      <header className="bg-[#1B1A1C] px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png?v=2" alt="Exodia" className="h-10 w-auto" />
          <span className="text-white text-xl font-bold tracking-wide">Exodia Operations Portal</span>
        </div>
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

      <div className="flex flex-1">
        <aside className="w-64 bg-[#1B1A1C] flex flex-col gap-1 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#FF5900] text-white'
                  : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-10">
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

          {activeTab === 'players' && <Players />}
        </main>
      </div>
    </div>
  )
}

export default Dashboard