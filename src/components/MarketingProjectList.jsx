import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '@iconify/react'

function formatDateTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  let h = d.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`
}

function getFeasibilityStatus(createdAt) {
  if (!createdAt) return { text: 'Feasibility checking - 1st Day', color: 'bg-yellow-100 text-yellow-700' }
  const start = new Date(createdAt)
  const now = new Date()
  const diffMs = now - start
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays >= 2) return { text: 'Waiting for Discovery Meeting link', color: 'bg-purple-100 text-purple-700' }
  if (diffDays >= 1) return { text: 'Feasibility checking - Final Day', color: 'bg-orange-100 text-orange-700' }
  return { text: 'Feasibility checking - 1st Day', color: 'bg-yellow-100 text-yellow-700' }
}

function MarketingProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('prt_potential_projects') || '[]')
    setProjects(stored)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Project List - Marketing View</h2>
        <div className="text-[#3E4048]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#1B1A1C] text-xl font-semibold mb-1">Project List - Marketing View</h2>
            <p className="text-[#3E4048] text-sm">View all potential projects in the feasibility pipeline</p>
          </div>
          <span className="text-sm text-[#3E4048] bg-[#CACDD7]/30 px-3 py-1 rounded-full">
            {projects.length} projects
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <Icon icon="lucide:folder-kanban" className="w-12 h-12 text-[#CACDD7] mx-auto mb-4" />
            <p className="text-[#3E4048] text-sm">No potential projects yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#CACDD7]">
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Tracking ID</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium hidden md:table-cell">Client</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Project</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium hidden lg:table-cell">Received</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium hidden lg:table-cell">Feasibility Started</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} className="border-b border-[#CACDD7]/50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap text-xs font-mono">{p.tracking_id || '-'}</td>
                    <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden md:table-cell">{p.client_name || '-'}</td>
                    <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap">{p.project_name || 'Untitled'}</td>
                    <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{formatDateTime(p.sent_at)}</td>
                    <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.createdAt ? formatDateTime(p.createdAt) : 'Today'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getFeasibilityStatus(p.createdAt).color}`}>
                        {getFeasibilityStatus(p.createdAt).text}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketingProjectList