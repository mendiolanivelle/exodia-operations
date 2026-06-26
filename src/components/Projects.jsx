import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const stages = [
  { key: 'initiation', label: 'Project Initiation', color: 'bg-blue-500' },
  { key: 'pre-production', label: 'Pre-Production', color: 'bg-purple-500' },
  { key: 'production', label: 'Production', color: 'bg-orange-500' },
  { key: 'post-production', label: 'Post Production & Final QA', color: 'bg-red-500' },
  { key: 'service-ops', label: 'Service Ops', color: 'bg-green-500' },
]

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase.from('projects').select('*')
        if (error) throw error
        setProjects(data || [])
      } catch {
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const getStageCount = (stageKey) => {
    return projects.filter(p => {
      const s = (p.stage || p.current_stage || p.status || p.phase || '').toLowerCase()
      if (stageKey === 'initiation') return s.includes('initiation') || s.includes('concept')
      if (stageKey === 'pre-production') return s.includes('pre') || s.includes('preproduction')
      if (stageKey === 'production') return s === 'production' || s.includes('production')
      if (stageKey === 'post-production') return s.includes('post') || s.includes('qa') || s.includes('final')
      if (stageKey === 'service-ops') return s.includes('service') || s.includes('live') || s.includes('ops')
      return false
    }).length
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Project Dashboard</h2>
        <div className="text-[#3E4048]">Loading project data...</div>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <h2 className="text-[#1B1A1C] text-xl font-semibold mb-6">Project Dashboard</h2>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, index) => (
          <div key={stage.key} className="flex items-center gap-4 min-w-0">
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 min-w-[200px] shadow-sm border border-[#CACDD7]/30">
              <div className={`w-12 h-12 rounded-full ${stage.color} flex items-center justify-center text-white text-xl font-bold mb-3`}>
                {getStageCount(stage.key)}
              </div>
              <span className="text-[#1B1A1C] text-sm font-medium text-center leading-tight">{stage.label}</span>
            </div>
            {index < stages.length - 1 && (
              <div className="text-[#CACDD7] text-2xl font-light hidden sm:block">›</div>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-[#3E4048] text-sm mt-4">No projects found. Add projects to get started.</p>
      )}
    </div>
  )
}

export default Projects