import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const stages = [
  { key: 'initiation', label: 'Project Initiation', dotColor: 'bg-green-500' },
  { key: 'pre-production', label: 'Pre-Production', dotColor: 'bg-purple-500' },
  { key: 'production', label: 'Production', dotColor: 'bg-orange-500' },
  { key: 'post-production', label: 'Post Production & Final QA', dotColor: 'bg-red-500' },
  { key: 'service-ops', label: 'Service Ops', dotColor: 'bg-green-500' },
]

const stageBgs = [
  'linear-gradient(135deg, #ffffff 0%, #e8e8ec 100%)',
  'linear-gradient(135deg, #f5f5f7 0%, #c4c5c9 100%)',
  'linear-gradient(135deg, #e0e0e3 0%, #8a8b90 100%)',
  'linear-gradient(135deg, #b0b0b5 0%, #4a4b4f 100%)',
  'linear-gradient(135deg, #707075 0%, #1B1A1C 100%)',
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
              <div
                className="flex flex-col items-center rounded-xl p-6 min-w-[200px] shadow-sm border border-[#CACDD7]/30"
                style={{ background: stageBgs[index] }}
              >
                <div className={`w-12 h-12 rounded-full ${stage.dotColor} flex items-center justify-center text-white text-xl font-bold mb-3`}>
                  {getStageCount(stage.key)}
                </div>
                <span className={`text-sm font-medium text-center leading-tight ${index >= 3 ? 'text-white' : 'text-[#1B1A1C]'}`}>{stage.label}</span>
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