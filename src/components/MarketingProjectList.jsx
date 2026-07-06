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

function formatDateInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toISOString().slice(0, 16)
}

function getFeasibilityStatus(createdAt) {
  if (!createdAt) return { text: 'Feasibility checking - 1st Day', color: 'bg-yellow-100 text-yellow-700', key: 'day1' }
  const start = new Date(createdAt)
  const now = new Date()
  const diffMs = now - start
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays >= 2) return { text: 'Waiting for Discovery Meeting link', color: 'bg-purple-100 text-purple-700', key: 'waiting' }
  if (diffDays >= 1) return { text: 'Feasibility checking - Final Day', color: 'bg-orange-100 text-orange-700', key: 'final' }
  return { text: 'Feasibility checking - 1st Day', color: 'bg-yellow-100 text-yellow-700', key: 'day1' }
}

function ScheduleMeetingModal({ project, onClose, onScheduled }) {
  const [date, setDate] = useState(() => {
    const d = new Date()
    d.setHours(d.getHours() + 1, 0, 0, 0)
    return formatDateInput(d.toISOString())
  })
  const [attendees, setAttendees] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSchedule = () => {
    setSending(true)
    setError('')
    const client = google.accounts.oauth2.initTokenClient({
      client_id: '771932544725-5trevl51v4i49g8j0a0vnqkh7hnikd12.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: async (response) => {
        if (response.error) {
          setError('Access denied — please allow Calendar access')
          setSending(false)
          return
        }
        try {
          const startDate = new Date(date)
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
          const attendeeList = attendees.split(',').map(a => a.trim()).filter(Boolean)
            .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
            .map(email => ({ email }))

          if (attendeeList.length === 0) {
            setError('Please add at least one valid attendee email')
            setSending(false)
            return
          }

          const event = {
            summary: `Discovery Meeting - ${project.project_name || 'Untitled'}`,
            description: `Discovery call for project: ${project.project_name}\nTracking ID: ${project.tracking_id}`,
            start: { dateTime: startDate.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            end: { dateTime: endDate.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            attendees: attendeeList,
            conferenceData: { createRequest: { requestId: `${project.id}-${Date.now()}` } },
          }

          const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${response.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          })

          if (!res.ok) {
            const err = await res.json()
            setError(err.error?.message || 'Failed to create event')
            setSending(false)
            return
          }

          const created = await res.json()
          onScheduled(created)
        } catch {
          setError('Could not create meeting')
          setSending(false)
        }
      },
    })
    client.requestAccessToken()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1B1A1C] text-lg font-bold">Schedule Discovery Meeting</h3>
          <button onClick={onClose} className="text-[#3E4048] hover:text-[#1B1A1C] cursor-pointer">
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-4">
            <p className="text-xs text-[#3E4048] font-medium">Project</p>
            <p className="text-sm text-[#1B1A1C] font-semibold mt-0.5">{project.project_name || 'Untitled'}</p>
            <p className="text-xs text-[#3E4048] mt-1">Tracking: {project.tracking_id} | Client: {project.client_name || '-'}</p>
          </div>

          <div>
            <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Date & Time</label>
            <input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]"
            />
          </div>

          <div>
            <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Attendees (email, comma separated)</label>
            <input
              type="text"
              value={attendees}
              onChange={e => setAttendees(e.target.value)}
              placeholder="ops@exodiagamedev.com, manager@exodiagamedev.com"
              className="w-full px-4 py-2.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]"
            />
            <p className="text-xs text-[#3E4048] mt-1">Client will be automatically added</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="text-[#3E4048] text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={sending || !date}
            className="bg-[#1B1A1C] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Creating...' : 'Create Google Meet'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MarketingProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [successProject, setSuccessProject] = useState(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('prt_potential_projects') || '[]')
    setProjects(stored)
    setLoading(false)
  }, [])

  const handleScheduled = (event) => {
    const updated = projects.map(p => {
      if (p.id === selectedProject.id) {
        return { ...p, status: 'discovery_scheduled', meetLink: event.hangoutLink, eventId: event.id }
      }
      return p
    })
    setProjects(updated)
    localStorage.setItem('prt_potential_projects', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('prt-projects-updated'))
    setSelectedProject(null)
    setSuccessProject({ ...selectedProject, meetLink: event.hangoutLink })
  }

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
      {selectedProject && (
        <ScheduleMeetingModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onScheduled={handleScheduled}
        />
      )}
      {successProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSuccessProject(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="lucide:check-check" className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-[#1B1A1C] text-lg font-bold mb-1">Schedule Sent!</h3>
            <p className="text-[#3E4048] text-sm mb-6">Meeting invitation has been sent to attendees.</p>
            <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-xs text-[#3E4048]">Tracking ID</span>
                <span className="text-xs text-[#1B1A1C] font-semibold">{successProject.tracking_id || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#3E4048]">Project</span>
                <span className="text-xs text-[#1B1A1C] font-semibold">{successProject.project_name || 'Untitled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#3E4048]">Client</span>
                <span className="text-xs text-[#1B1A1C] font-semibold">{successProject.client_name || '-'}</span>
              </div>
              {successProject.meetLink && (
                <div className="pt-2 border-t border-[#CACDD7]/30">
                  <a href={successProject.meetLink} target="_blank" rel="noopener noreferrer" className="text-[#FF5900] text-xs font-semibold flex items-center gap-1 justify-center">
                    <Icon icon="lucide:video" className="w-3.5 h-3.5" />
                    Open Google Meet
                  </a>
                </div>
              )}
            </div>
            <button
              onClick={() => setSuccessProject(null)}
              className="bg-[#1B1A1C] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
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
                {projects
                  .sort((a, b) => {
                    if (a.status === 'discovery_scheduled' && b.status !== 'discovery_scheduled') return -1
                    if (a.status !== 'discovery_scheduled' && b.status === 'discovery_scheduled') return 1
                    return 0
                  })
                  .map(p => {
                  const status = p.status === 'discovery_scheduled'
                    ? { text: 'Scheduled Discovery Meeting', color: 'bg-green-100 text-green-700', key: 'scheduled' }
                    : getFeasibilityStatus(p.createdAt)
                  return (
                    <tr
                      key={p.id}
                      onClick={status.key === 'waiting' ? () => setSelectedProject(p) : undefined}
                      className={`border-b border-[#CACDD7]/50 transition-colors ${
                        status.key === 'waiting' ? 'hover:bg-purple-50 cursor-pointer' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap text-xs font-mono">{p.tracking_id || '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden md:table-cell">{p.client_name || '-'}</td>
                      <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap">{p.project_name || 'Untitled'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{formatDateTime(p.sent_at)}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.createdAt ? formatDateTime(p.createdAt) : 'Today'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {status.key === 'scheduled' ? (
                          <a
                            href={p.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          >
                            {status.text}
                          </a>
                        ) : (
                          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketingProjectList