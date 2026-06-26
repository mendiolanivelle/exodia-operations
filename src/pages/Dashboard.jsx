import { useState } from 'react'
import { useAuth } from '../lib/useAuth'
import Players from '../components/Players'
import Projects from '../components/Projects'
import ManpowerPricing from '../components/ManpowerPricing'

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
        <aside className="w-64 flex-shrink-0 bg-[#1B1A1C] flex flex-col gap-1 p-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            Dashboard
          </button>

          <div className="text-[#CACDD7]/50 text-xs font-semibold uppercase tracking-wider px-5 pt-4 pb-1">
            Players
          </div>
          <button
            onClick={() => setActiveTab('player-list')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'player-list'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            Player List
          </button>
          <button
            onClick={() => setActiveTab('role-inventory')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'role-inventory'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            Role Inventory
          </button>

          <div className="text-[#CACDD7]/50 text-xs font-semibold uppercase tracking-wider px-5 pt-4 pb-1">
            Project
          </div>
          <button
            onClick={() => setActiveTab('project-dashboard')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'project-dashboard'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            Project Dashboard
          </button>
          <button
            onClick={() => setActiveTab('project-list')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'project-list'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            Project List
          </button>

          <div className="text-[#CACDD7]/50 text-xs font-semibold uppercase tracking-wider px-5 pt-4 pb-1">
            Pricing
          </div>
          <button
            onClick={() => setActiveTab('manpower-pricing')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'manpower-pricing'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            Manpower & Pricing
          </button>
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

          {activeTab === 'player-list' && <Players />}

          {activeTab === 'role-inventory' && (
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Role Inventory</h2>
              <p className="text-[#3E4048]">Role inventory coming soon.</p>
            </div>
          )}

          {activeTab === 'project-dashboard' && <Projects />}

          {activeTab === 'project-list' && (
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Project List</h2>
              <p className="text-[#3E4048]">Project list coming soon.</p>
            </div>
          )}

          {activeTab === 'manpower-pricing' && <ManpowerPricing />}
        </main>
      </div>
    </div>
  )
}

export default Dashboard