import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '@iconify/react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }

function ProjectList() {
  const [potentialProjects, setPotentialProjects] = useState([])
  const [approvedProjects, setApprovedProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [potentialRes, approvedRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/project_review_tickets?status=eq.potential&select=id,project_name,client_name,tracking_id,sent_at&order=sent_at.desc`, { headers }),
        supabase.from('projects').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
      ])
      if (potentialRes.ok) {
        const data = await potentialRes.json()
        setPotentialProjects(data || [])
      }
      if (!approvedRes.error) setApprovedProjects(approvedRes.data || [])
    } catch {
      setPotentialProjects([])
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
      setPotentialProjects(prev => prev.filter(p => p.id !== project.id))
      if (data) setApprovedProjects(prev => [data[0], ...prev])
    } catch {}
  }

  const allEmpty = potentialProjects.length === 0 && approvedProjects.length === 0

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
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex-1">
            <p className="text-amber-700 text-xs font-medium uppercase tracking-wider">Potential Projects</p>
            <p className="text-amber-900 text-3xl font-bold mt-1">{potentialProjects.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex-1">
            <p className="text-green-700 text-xs font-medium uppercase tracking-wider">Approved Projects</p>
            <p className="text-green-900 text-3xl font-bold mt-1">{approvedProjects.length}</p>
          </div>
        </div>

        {potentialProjects.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[#1B1A1C] text-base font-semibold mb-3 flex items-center gap-2">
              <Icon icon="lucide:clock" className="w-4 h-4 text-amber-600" />
              Potential Projects
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#CACDD7]">
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Project</th>
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium hidden md:table-cell">Client</th>
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium hidden lg:table-cell">Tracking ID</th>
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3 text-[#3E4048] font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {potentialProjects.map(p => (
                    <tr key={p.id} className="border-b border-[#CACDD7]/50 hover:bg-amber-50/50 transition-colors">
                      <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap">{p.project_name || 'Untitled'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden md:table-cell">{p.client_name || '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell text-xs font-mono">{p.tracking_id || '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.sent_at ? new Date(p.sent_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleApprove(p)}
                          className="bg-green-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-green-700 transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {approvedProjects.length > 0 && (
          <div>
            <h3 className="text-[#1B1A1C] text-base font-semibold mb-3 flex items-center gap-2">
              <Icon icon="lucide:check-circle" className="w-4 h-4 text-green-600" />
              Approved Projects
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

        {allEmpty && (
          <div className="text-center py-16">
            <Icon icon="lucide:folder-kanban" className="w-12 h-12 text-[#CACDD7] mx-auto mb-4" />
            <p className="text-[#3E4048] text-sm">No projects yet. Click "Proceed to Feasibility check" from a review ticket to create one.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectList