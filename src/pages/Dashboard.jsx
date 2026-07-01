import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/useAuth'
import { Icon } from '@iconify/react'
import { supabase } from '../lib/supabase'
import Players from '../components/Players'
import Projects from '../components/Projects'
import ManpowerPricing from '../components/ManpowerPricing'
import RoleInventory from '../components/RoleInventory'
import ProjectReviewTicket from '../components/ProjectReviewTicket'
import ProjectList from '../components/ProjectList'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const VIEWED_IDS_KEY = 'prt_viewed_ids'
const NOTIF_KEY = 'op_notifications'

function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [totalTickets, setTotalTickets] = useState(0)
  const [teamMemberCount, setTeamMemberCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'))
  const prevCountRef = useRef(totalTickets)
  const notifPanelRef = useRef(null)

  const viewedIds = JSON.parse(localStorage.getItem(VIEWED_IDS_KEY) || '[]')
  const unread = Math.max(0, totalTickets - viewedIds.length)
  const notifRef = useRef(notifications)
  notifRef.current = notifications

  const addNotif = (msg) => {
    const entry = { id: Date.now(), msg, time: new Date().toLocaleString(), read: false }
    const updated = [entry, ...notifRef.current].slice(0, 50)
    setNotifications(updated)
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated))
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tracking_id')) {
      setActiveTab('project-review')
    }
    const handler = () => setRefreshKey(k => k + 1)
    window.addEventListener('prt-viewed', handler)
    const closeNotif = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target)) setShowNotif(false)
    }
    window.addEventListener('mousedown', closeNotif)
    return () => {
      window.removeEventListener('prt-viewed', handler)
      window.removeEventListener('mousedown', closeNotif)
    }
  }, [])

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/project_review_tickets?select=id`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        })
        if (res.ok) {
          const data = await res.json()
          const count = data.length
          if (prevCountRef.current > 0 && count > prevCountRef.current) {
            const entry = { id: Date.now(), msg: 'New project review ticket added', time: new Date().toLocaleString(), read: false }
            const updated = [entry, ...notifRef.current].slice(0, 50)
            setNotifications(updated)
            localStorage.setItem(NOTIF_KEY, JSON.stringify(updated))
          }
          prevCountRef.current = count
          setTotalTickets(count)
        }
      } catch {}
    }
    const fetchTeamCount = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_master')
          .select('employee_id')
          .eq('department_text', 'Operation')
        if (error) throw error
        const seen = new Set()
        const unique = (data || []).filter(emp => {
          const key = emp.employee_id
          if (!key || seen.has(key)) return false
          seen.add(key)
          return true
        })
        setTeamMemberCount(unique.length)
      } catch {}
    }
    const fetchProjectCount = async () => {
      try {
        const { count } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
        if (count !== null) setProjectCount(count)
      } catch {}
    }
    fetchCount()
    fetchTeamCount()
    fetchProjectCount()
    const interval = setInterval(fetchCount, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleProjectReviewClick = () => {
    setActiveTab('project-review')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#CACDD7]/20">
      <header className="bg-[#1B1A1C] px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png?v=2" alt="Exodia" className="h-10 w-auto" />
          <span className="text-white text-xl font-bold tracking-wide">Exodia Operations Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" ref={notifPanelRef}>
            <button onClick={() => setShowNotif(v => !v)} className="relative cursor-pointer">
              <Icon icon="lucide:bell" className="w-5 h-5 text-[#CACDD7] hover:text-white transition-colors" />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#CACDD7]/30 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-[#CACDD7]/30 flex items-center justify-between">
                  <h3 className="text-[#1B1A1C] text-sm font-semibold">Notifications</h3>
                  {notifications.length > 0 && (
                    <button onClick={() => { setNotifications([]); localStorage.removeItem(NOTIF_KEY) }} className="text-xs text-[#3E4048] hover:text-red-500 cursor-pointer">Clear all</button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[#3E4048] text-sm">No notifications yet.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 border-b border-[#CACDD7]/20 text-sm hover:bg-gray-50">
                      <p className="text-[#1B1A1C]">{n.msg}</p>
                      <p className="text-[#3E4048] text-xs mt-0.5">{n.time}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <span className="text-[#CACDD7] text-sm">{user?.email}</span>
          <button
            onClick={logout}
            className="text-[#CACDD7] hover:text-red-400 transition-colors cursor-pointer"
            title="Logout"
          >
            <Icon icon="lucide:log-out" className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 flex-shrink-0 bg-[#1B1A1C] flex flex-col gap-1 p-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${
              activeTab === 'dashboard'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon icon="lucide:layout-dashboard" className="w-4 h-4 flex-shrink-0" />
            Dashboard
          </button>

          <div className="text-[#CACDD7]/50 text-xs font-semibold uppercase tracking-wider px-5 pt-4 pb-1">
            Players
          </div>
          <button
            onClick={() => setActiveTab('player-list')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${
              activeTab === 'player-list'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon icon="lucide:users" className="w-4 h-4 flex-shrink-0" />
            Player List
          </button>
          <button
            onClick={() => setActiveTab('role-inventory')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${
              activeTab === 'role-inventory'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon icon="lucide:briefcase-business" className="w-4 h-4 flex-shrink-0" />
            Role Inventory
          </button>

          <div className="text-[#CACDD7]/50 text-xs font-semibold uppercase tracking-wider px-5 pt-4 pb-1">
            Project
          </div>
          <button
            onClick={() => setActiveTab('project-dashboard')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${
              activeTab === 'project-dashboard'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon icon="lucide:kanban-square" className="w-4 h-4 flex-shrink-0" />
            Project Dashboard
          </button>
          <button
            onClick={() => setActiveTab('project-list')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${
              activeTab === 'project-list'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon icon="lucide:folder-kanban" className="w-4 h-4 flex-shrink-0" />
            Project List
          </button>
          <button
            onClick={handleProjectReviewClick}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${
              activeTab === 'project-review'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon icon="lucide:file-text" className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Project Review Ticket</span>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>

          <div className="text-[#CACDD7]/50 text-xs font-semibold uppercase tracking-wider px-5 pt-4 pb-1">
            Pricing
          </div>
          <button
            onClick={() => setActiveTab('manpower-pricing')}
            className={`w-full text-left px-5 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${
              activeTab === 'manpower-pricing'
                ? 'bg-[#FF5900] text-white'
                : 'text-[#CACDD7] hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon icon="lucide:dollar-sign" className="w-4 h-4 flex-shrink-0" />
            Manpower & Pricing
          </button>
        </aside>

        <main className="flex-1 min-w-0 p-10">
          {activeTab === 'dashboard' && (
            <>
              <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
                <h2 className="text-[#1B1A1C] text-xl font-semibold mb-2">Welcome to Operations</h2>
                <p className="text-[#3E4048]">You are now logged in. This is your operations dashboard.</p>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
                <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <h3 className="text-[#3E4048] text-base font-medium mb-4">Active Projects</h3>
                  <p className="text-[#FF5900] text-5xl font-bold">{projectCount}</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <h3 className="text-[#3E4048] text-base font-medium mb-4">Pending Tasks</h3>
                  <p className="text-[#FF5900] text-5xl font-bold">0</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <h3 className="text-[#3E4048] text-base font-medium mb-4">Team Members</h3>
                  <p className="text-[#FF5900] text-5xl font-bold">{teamMemberCount}</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'player-list' && <Players />}

          {activeTab === 'role-inventory' && <RoleInventory />}

          {activeTab === 'project-dashboard' && <Projects />}

          {activeTab === 'project-list' && <ProjectList />}

          {activeTab === 'project-review' && <ProjectReviewTicket />}

          {activeTab === 'manpower-pricing' && <ManpowerPricing />}
        </main>
      </div>
    </div>
  )
}

export default Dashboard