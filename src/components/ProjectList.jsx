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

function getFeasibilityDay(createdAt) {
  if (!createdAt) return { text: 'Feasibility Checking Day - 1', color: 'bg-yellow-100 text-yellow-700' }
  const diffDays = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24))
  if (diffDays >= 1) return { text: 'Feasibility Checking Final Day', color: 'bg-orange-100 text-orange-700' }
  return { text: 'Feasibility Checking Day - 1', color: 'bg-yellow-100 text-yellow-700' }
}

function ProjectList() {
  const [potentialProjects, setPotentialProjects] = useState([])
  const [approvedProjects, setApprovedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('potential')
  const [detailProject, setDetailProject] = useState(null)

  useEffect(() => {
    fetchAll()
    const handler = () => {
      const stored = JSON.parse(localStorage.getItem('prt_potential_projects') || '[]')
      setPotentialProjects(stored)
    }
    window.addEventListener('storage', handler)
    window.addEventListener('prt-projects-updated', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('prt-projects-updated', handler)
    }
  }, [])

  const fetchAll = async () => {
    const stored = JSON.parse(localStorage.getItem('prt_potential_projects') || '[]')
    setPotentialProjects(stored)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      if (!error) setApprovedProjects(data || [])
    } catch {
      setApprovedProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (project) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          project_name: project.project_name,
          client_name: project.client_name,
          tracking_id: project.tracking_id,
          status: 'approved',
        })
        .select()
      if (error) throw error
      const updated = potentialProjects.filter(p => p.id !== project.id)
      setPotentialProjects(updated)
      localStorage.setItem('prt_potential_projects', JSON.stringify(updated))
      if (data) setApprovedProjects(prev => [data[0], ...prev])
    } catch {}
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Project List</h2>
        <div className="text-[#3E4048]">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-1">Project List</h2>
        <p className="text-[#3E4048] text-sm mb-6">Manage potential and approved projects</p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('potential')}
            className={`flex-1 rounded-xl px-5 py-4 text-left transition-all cursor-pointer ${
              tab === 'potential' ? 'bg-amber-50 border-2 border-amber-300' : 'bg-amber-50/50 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <p className="text-amber-700 text-xs font-medium uppercase tracking-wider">Potential Projects</p>
            <p className="text-amber-900 text-3xl font-bold mt-1">{potentialProjects.length}</p>
          </button>
          <button
            onClick={() => setTab('projects')}
            className={`flex-1 rounded-xl px-5 py-4 text-left transition-all cursor-pointer ${
              tab === 'projects' ? 'bg-green-50 border-2 border-green-300' : 'bg-green-50/50 border border-green-200 hover:bg-green-50'
            }`}
          >
            <p className="text-green-700 text-xs font-medium uppercase tracking-wider">Projects</p>
            <p className="text-green-900 text-3xl font-bold mt-1">{approvedProjects.length}</p>
          </button>
        </div>

        {tab === 'potential' && potentialProjects.length > 0 && (
          <div>
            <h3 className="text-[#1B1A1C] text-base font-semibold mb-3 flex items-center gap-2">
              <Icon icon="lucide:clock" className="w-4 h-4 text-amber-600" />
              Potential Projects
            </h3>
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
                  {potentialProjects
                  .sort((a, b) => {
                    if (a.status === 'discovery_scheduled' && b.status !== 'discovery_scheduled') return -1
                    if (a.status !== 'discovery_scheduled' && b.status === 'discovery_scheduled') return 1
                    return 0
                  })
                  .map(p => {
                    const isScheduled = p.status === 'discovery_scheduled'
                    const day = getFeasibilityDay(p.createdAt)
                    const action = isScheduled
                      ? { text: 'Scheduled Discovery meeting', color: 'bg-green-100 text-green-700' }
                      : { text: 'Waiting for discovery meeting link', color: 'bg-purple-100 text-purple-700' }
                    return (
                    <tr
                      key={p.id}
                      onClick={isScheduled ? () => setDetailProject(p) : undefined}
                      className={`border-b border-[#CACDD7]/50 transition-colors ${
                        isScheduled ? 'hover:bg-green-50 cursor-pointer' : 'hover:bg-amber-50/50'
                      }`}
                    >
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap text-xs font-mono">{p.tracking_id || '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden md:table-cell">{p.client_name || '-'}</td>
                      <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap">{p.project_name || 'Untitled'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.sent_at ? formatDateTime(p.sent_at) : '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.createdAt ? formatDateTime(p.createdAt) : 'Today'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${day.color}`}>
                            {day.text}
                          </span>
                          <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${action.color}`}>
                            {action.text}
                          </span>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'potential' && potentialProjects.length === 0 && (
          <div className="text-center py-12">
            <Icon icon="lucide:clock" className="w-10 h-10 text-[#CACDD7] mx-auto mb-3" />
            <p className="text-[#3E4048] text-sm">No potential projects yet.</p>
          </div>
        )}

        {tab === 'projects' && approvedProjects.length > 0 && (
          <div>
            <h3 className="text-[#1B1A1C] text-base font-semibold mb-3 flex items-center gap-2">
              <Icon icon="lucide:check-circle" className="w-4 h-4 text-green-600" />
              Projects
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#CACDD7]">
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Project</th>
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium hidden md:table-cell">Client</th>
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium hidden lg:table-cell">Tracking ID</th>
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3 text-[#3E4048] font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedProjects.map(p => (
                    <tr key={p.id} className="border-b border-[#CACDD7]/50 hover:bg-green-50/50 transition-colors">
                      <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap">{p.project_name || p.name || 'Untitled'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden md:table-cell">{p.client_name || '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell text-xs font-mono">{p.tracking_id || '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Approved</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'projects' && approvedProjects.length === 0 && (
          <div className="text-center py-12">
            <Icon icon="lucide:check-circle" className="w-10 h-10 text-[#CACDD7] mx-auto mb-3" />
            <p className="text-[#3E4048] text-sm">No approved projects yet.</p>
          </div>
        )}
      </div>

      {detailProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetailProject(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1B1A1C] text-lg font-bold">Discovery Meeting</h3>
              <button onClick={() => setDetailProject(null)} className="text-[#3E4048] hover:text-[#1B1A1C] cursor-pointer">
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#3E4048]">Tracking ID</span>
                <span className="text-sm text-[#1B1A1C] font-semibold">{detailProject.tracking_id || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#3E4048]">Project</span>
                <span className="text-sm text-[#1B1A1C] font-semibold">{detailProject.project_name || 'Untitled'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#3E4048]">Client</span>
                <span className="text-sm text-[#1B1A1C] font-semibold">{detailProject.client_name || '-'}</span>
              </div>
              {detailProject.meetLink && (
                <div className="pt-3 border-t border-[#CACDD7]/30">
                  <a
                    href={detailProject.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1B1A1C] text-white w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Icon icon="lucide:video" className="w-4 h-4" />
                    Open Google Meet
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectList