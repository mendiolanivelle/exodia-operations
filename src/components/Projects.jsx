import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const stages = [
  { key: 'initiation', label: 'Project Initiation', gradient: 'linear-gradient(135deg, #ffffff, #d4d4d8)', textColor: 'text-[#1B1A1C]' },
  { key: 'pre-production', label: 'Pre-Production', gradient: 'linear-gradient(135deg, #d4d4d8, #a1a1aa)', textColor: 'text-[#1B1A1C]' },
  { key: 'production', label: 'Production', gradient: 'linear-gradient(135deg, #a1a1aa, #71717a)', textColor: 'text-white' },
  { key: 'post-production', label: 'Post Production & Final QA', gradient: 'linear-gradient(135deg, #71717a, #52525b)', textColor: 'text-white' },
  { key: 'service-ops', label: 'Service Ops', gradient: 'linear-gradient(135deg, #52525b, #3f3f46)', textColor: 'text-white' },
  { key: 'close-out', label: 'Close Out', gradient: 'linear-gradient(135deg, #3f3f46, #1B1A1C)', textColor: 'text-white' },
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
      if (stageKey === 'close-out') return s.includes('close') || s.includes('complete') || s.includes('done')
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
    <div className="flex flex-col gap-6">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#1B1A1C] text-xl font-semibold mb-1">Projects</h2>
            <p className="text-[#3E4048] text-sm">Total number of projects in the pipeline</p>
          </div>
          <div className="bg-[#1B1A1C] rounded-full w-20 h-20 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">{projects.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h3 className="text-[#1B1A1C] text-lg font-semibold mb-6">Project Phases</h3>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage, index) => (
            <div key={stage.key} className="flex items-center gap-4 min-w-0">
              <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 min-w-[200px] shadow-sm border border-[#CACDD7]/30">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-3 ${stage.textColor}`} style={{ background: stage.gradient }}>
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
    </div>
  )
}

export default Projects