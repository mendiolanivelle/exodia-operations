import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '@iconify/react'

function ProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setProjects(data || [])
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'approved' })
        .eq('id', id)
      if (error) throw error
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p))
    } catch {}
  }

  const potential = projects.filter(p => p.status === 'potential')
  const approved = projects.filter(p => p.status === 'approved')

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
            <p className="text-amber-900 text-3xl font-bold mt-1">{potential.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex-1">
            <p className="text-green-700 text-xs font-medium uppercase tracking-wider">Approved Projects</p>
            <p className="text-green-900 text-3xl font-bold mt-1">{approved.length}</p>
          </div>
        </div>

        {potential.length > 0 && (
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
                  {potential.map(p => (
                    <tr key={p.id} className="border-b border-[#CACDD7]/50 hover:bg-amber-50/50 transition-colors">
                      <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap">{p.project_name || p.name || 'Untitled'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden md:table-cell">{p.client_name || '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell text-xs font-mono">{p.tracking_id || '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleApprove(p.id)}
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

        {approved.length > 0 && (
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
                  {approved.map(p => (
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

        {projects.length === 0 && (
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