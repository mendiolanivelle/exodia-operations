import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '@iconify/react'

const stages = [
  { key: 'initiation', label: 'Project Initiation', gradient: 'linear-gradient(135deg, #ffffff, #d4d4d8)', textColor: 'text-[#1B1A1C]' },
  { key: 'pre-production', label: 'Pre-Production', gradient: 'linear-gradient(135deg, #d4d4d8, #a1a1aa)', textColor: 'text-[#1B1A1C]' },
  { key: 'production', label: 'Production', gradient: 'linear-gradient(135deg, #a1a1aa, #71717a)', textColor: 'text-white' },
  { key: 'post-production', labelTop: 'Post Production', labelBottom: '& Final QA', gradient: 'linear-gradient(135deg, #71717a, #52525b)', textColor: 'text-white' },
  { key: 'service-ops', label: 'Service Ops', gradient: 'linear-gradient(135deg, #52525b, #3f3f46)', textColor: 'text-white' },
  { key: 'close-out', label: 'Close Out', gradient: 'linear-gradient(135deg, #3f3f46, #1B1A1C)', textColor: 'text-white' },
]

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseHeaders = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }

function formatDateTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  let h = d.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`
}

function MeetingNotesModal({ project, onClose, onSave }) {
  const [notes, setNotes] = useState('')
  const [videoLink, setVideoLink] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setNotes(project.notes || '')
      setVideoLink(project.videoLink || '')
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/project_review_tickets?tracking_id=eq.${encodeURIComponent(project.tracking_id)}&select=additional_attachments`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        })
        if (res.ok) {
          const rows = await res.json()
          if (rows && rows[0]?.additional_attachments) {
            const meta = rows[0].additional_attachments.find(a => a._type === 'meeting_notes')
            if (meta) {
              if (meta.notes) setNotes(meta.notes)
              if (meta.videoLink) setVideoLink(meta.videoLink)
            }
          }
        }
      } catch {}
      setLoading(false)
    })()
  }, [])

  const handleSave = () => {
    onSave(project.tracking_id, { notes, videoLink })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1B1A1C] text-lg font-bold">Discovery Meeting Documentation</h3>
          <button onClick={onClose} className="text-[#3E4048] hover:text-[#1B1A1C] cursor-pointer">
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-4 mb-5">
          <p className="text-xs text-[#3E4048] font-medium">Project</p>
          <p className="text-sm text-[#1B1A1C] font-semibold mt-0.5">{project.project_name || 'Untitled'}</p>
          <p className="text-xs text-[#3E4048] mt-1">Tracking: {project.tracking_id} | Client: {project.client_name || '-'}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Meeting Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={8}
              placeholder="Document your discovery meeting notes here..."
              className="w-full px-4 py-2.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900] resize-none"
            />
          </div>
          <div>
            <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Video Recording Link</label>
            <input
              type="url"
              value={videoLink}
              onChange={e => setVideoLink(e.target.value)}
              placeholder="Paste Google Drive, YouTube, or other video link"
              className="w-full px-4 py-2.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="text-[#3E4048] text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#1B1A1C] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Save Documentation
          </button>
        </div>
      </div>
    </div>
  )
}

function getFeasibilityDay(createdAt) {
  if (!createdAt) return { text: 'Feasibility Review - Day 1', color: 'bg-yellow-100 text-yellow-700' }
  const diffDays = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24))
  if (diffDays >= 3) return { text: 'Overdue - Feasibility Decision', color: 'bg-red-100 text-red-700' }
  if (diffDays >= 2) return { text: 'Pending Feasibility Decision', color: 'bg-blue-100 text-blue-700' }
  if (diffDays >= 1) return { text: 'Feasibility Review - Final Day', color: 'bg-orange-100 text-orange-700' }
  return { text: 'Feasibility Review - Day 1', color: 'bg-yellow-100 text-yellow-700' }
}

function FeasibilityDecisionModal({ project, onClose, onApprove, onDecline }) {
  const [decision, setDecision] = useState(null)
  const [reasons, setReasons] = useState('')
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [successProject, setSuccessProject] = useState(null)
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  useEffect(() => {
    if (!decision) return
    const pn = project.project_name || 'Untitled'
    const cn = project.client_name || 'Client'
    const tid = project.tracking_id || '-'
    const header = `<table width="100%" cellpadding="0" cellspacing="0" style="background:#1B1A1C;padding:40px 20px;font-family:Arial,Helvetica,sans-serif">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden">
        <tr>
          <td style="background:#1B1A1C;padding:24px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
              <td style="color:#ffffff;font-size:18px;font-weight:700">Exodia Operations</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">`
    const footer = `</td>
        </tr>
        <tr>
          <td style="background:#F9FAFB;padding:16px 32px">
            <p style="color:#9CA3AF;font-size:11px;margin:0;text-align:center">Exodia Game Dev &middot; Operations Department</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
    if (decision === 'go') {
      setSubject(`Feasibility Decision - Go for ${pn} / ${tid}`)
      setHtmlBody(`${header}
            <h2 style="color:#1B1A1C;font-size:20px;margin:0 0 8px">Feasibility Decision - Go</h2>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 20px">Good Day Marketing,</p>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 12px">Thank you for forwarding <strong style="color:#FF5900">"${pn}"</strong>, tracking ID <strong style="color:#1B1A1C">${tid}</strong> to review.</p>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 12px">Operations has reviewed the project and the decision is <strong style="color:#16A34A">GO</strong>.</p>
            ${reasons ? `<p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 12px"><strong>Reasons:</strong><br/>${reasons.replace(/\n/g, '<br/>')}</p>` : ''}
            <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin:0 0 20px">
              <p style="color:#1B1A1C;font-size:13px;font-weight:600;margin:0 0 4px">Next Step</p>
              <p style="color:#3E4048;font-size:13px;line-height:1.5;margin:0">Let us know if you emailed the client for our feasibility decision so that we can proceed on INTERNAL PLANNING &amp; READINESS process.</p>
            </div>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 4px">Best regards,</p>
            <p style="color:#FF5900;font-size:14px;font-weight:600;margin:0">Exodia Operations Team</p>
          ${footer}`)
    } else if (decision === 'decline') {
      setSubject(`Feasibility Decision - Decline for ${pn} / ${tid}`)
      setHtmlBody(`${header}
            <h2 style="color:#1B1A1C;font-size:20px;margin:0 0 8px">Feasibility Decision - Decline</h2>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 20px">Good Day Marketing,</p>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 12px">Thank you for forwarding <strong style="color:#FF5900">"${pn}"</strong>, tracking ID <strong style="color:#1B1A1C">${tid}</strong> to review.</p>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 12px">After careful review, Operations has decided to <strong style="color:#DC2626">decline</strong> the project.</p>
            ${reasons ? `<p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 20px"><strong>Reasons:</strong><br/>${reasons.replace(/\n/g, '<br/>')}</p>` : ''}
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 4px">Best regards,</p>
            <p style="color:#FF5900;font-size:14px;font-weight:600;margin:0">Exodia Operations Team</p>
          ${footer}`)
    }
  }, [decision, reasons, project])

  const handleSubmit = () => {
    if (!to) { setError('Enter recipient email'); return }
    setSending(true)
    setError('')
    const client = google.accounts.oauth2.initTokenClient({
      client_id: '771932544725-5trevl51v4i49g8j0a0vnqkh7hnikd12.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/gmail.send',
      callback: async (response) => {
        if (response.error) {
          setError('Access denied')
          setSending(false)
          return
        }
        try {
          const email = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: 7bit',
            `To: ${to}`,
            `Subject: ${subject}`,
            '',
            htmlBody,
          ].join('\r\n')
          const raw = btoa(unescape(encodeURIComponent(email)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
          const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${response.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ raw }),
          })
          if (!res.ok) {
            const err = await res.json()
            setError(err.error?.message || 'Failed to send')
            setSending(false)
            return
          }
          if (decision === 'go') {
            await onApprove(project)
          } else if (decision === 'decline' && onDecline) {
            await onDecline(project)
          }
          setSuccessProject(project)
          setSending(false)
        } catch {
          setError('Could not send email')
          setSending(false)
        }
      },
    })
    client.requestAccessToken()
  }

return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
<div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#1B1A1C] text-lg font-bold">Feasibility Decision</h3>
            <button onClick={onClose} className="text-[#3E4048] hover:text-[#1B1A1C] cursor-pointer">
              <Icon icon="lucide:x" className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-4 mb-5">
            <p className="text-xs text-[#3E4048] font-medium">Project</p>
            <p className="text-sm text-[#1B1A1C] font-semibold mt-0.5">{project.project_name || 'Untitled'}</p>
            <p className="text-xs text-[#3E4048] mt-1">Tracking: {project.tracking_id} | Client: {project.client_name || '-'}</p>
          </div>

          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setDecision('go')}
              className={`flex-1 py-4 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${
                decision === 'go' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-[#CACDD7] text-[#3E4048] hover:border-green-300'
              }`}
            >
              <Icon icon="lucide:check-circle" className="w-5 h-5 mx-auto mb-1" />
              Go
            </button>
            <button
              onClick={() => setDecision('decline')}
              className={`flex-1 py-4 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${
                decision === 'decline' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-[#CACDD7] text-[#3E4048] hover:border-red-300'
              }`}
            >
              <Icon icon="lucide:x-circle" className="w-5 h-5 mx-auto mb-1" />
              Decline
            </button>
          </div>

          {decision && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">To</label>
                <input
                  type="email"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  placeholder="Marketing email"
                  className="w-full px-4 py-2.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]"
                />
              </div>
              <div>
                <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]"
                />
              </div>
              <div>
                <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Reasons</label>
                <textarea
                  value={reasons}
                  onChange={e => setReasons(e.target.value)}
                  rows={5}
                  placeholder="Enter the reasons for this decision..."
                  className="w-full px-4 py-2.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900] resize-none"
                />
              </div>
              <div>
                <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Email Preview</label>
                <div className="border border-[#CACDD7] rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                  <div className="bg-white p-4" dangerouslySetInnerHTML={{ __html: htmlBody }} />
                </div>
              </div>
            </div>
          )}

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
              onClick={handleSubmit}
              disabled={!decision || sending}
              className="bg-[#1B1A1C] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon="lucide:send" className="w-4 h-4 inline mr-1" />
              {sending ? 'Sending...' : 'Submit Decision'}
            </button>
          </div>
        </div>
      </div>

      {successProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="lucide:check-check" className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-[#1B1A1C] text-lg font-bold mb-1">Feasibility Decision Sent!</h3>
            <p className="text-[#3E4048] text-sm mb-6">The decision has been sent successfully.</p>
            <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-xs text-[#3E4048]">Project</span>
                <span className="text-xs text-[#1B1A1C] font-semibold">{successProject.project_name || 'Untitled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#3E4048]">Client</span>
                <span className="text-xs text-[#1B1A1C] font-semibold">{successProject.client_name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#3E4048]">Tracking ID</span>
                <span className="text-xs text-[#1B1A1C] font-semibold">{successProject.tracking_id || '-'}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-[#1B1A1C] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function ProjectList() {
  const [potentialProjects, setPotentialProjects] = useState([])
  const [approvedProjects, setApprovedProjects] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('potential')
  const [detailProject, setDetailProject] = useState(null)
  const [notesProject, setNotesProject] = useState(null)
  const [decisionProject, setDecisionProject] = useState(null)

  const saveProjectNotes = (trackingId, data) => {
    const updated = potentialProjects.map(p => {
      if (p.tracking_id === trackingId) {
        return { ...p, notes: data.notes, videoLink: data.videoLink }
      }
      return p
    })
    setPotentialProjects(updated)
    localStorage.setItem('prt_potential_projects', JSON.stringify(updated))
    fetch(`${supabaseUrl}/rest/v1/project_review_tickets?tracking_id=eq.${encodeURIComponent(trackingId)}`, {
      method: 'PATCH',
      headers: supabaseHeaders,
      body: JSON.stringify({ additional_attachments: [{ _type: 'meeting_notes', notes: data.notes, videoLink: data.videoLink }] }),
    })
  }

  const handleFeasibilityApprove = async (project) => {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('projects')
      .insert({ project_name: project.project_name, client_name: project.client_name, tracking_id: project.tracking_id, status: 'approved', feasibility_decision_at: now })
    if (error) return
    const updated = potentialProjects.filter(p => p.id !== project.id)
    setPotentialProjects(updated)
    localStorage.setItem('prt_potential_projects', JSON.stringify(updated))
    const { data } = await supabase.from('projects').select('*').eq('status', 'approved').order('created_at', { ascending: false })
    if (data) setApprovedProjects(data)
  }

  useEffect(() => {
    fetchAll()
    fetchAllProjects()
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

  const fetchAllProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*')
      if (!error) setAllProjects(data || [])
    } catch {
      setAllProjects([])
    }
  }

  const getStageCount = (stageKey) => {
    return allProjects.filter(p => {
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

  const handleApprove = async (project) => {
    try {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('projects')
        .insert({
          project_name: project.project_name,
          client_name: project.client_name,
          tracking_id: project.tracking_id,
          status: 'approved',
          feasibility_decision_at: now,
        })
        .select()
      if (error) throw error
      const updated = potentialProjects.filter(p => p.id !== project.id)
      setPotentialProjects(updated)
      localStorage.setItem('prt_potential_projects', JSON.stringify(updated))
      if (data) setApprovedProjects(prev => [data[0], ...prev])
    } catch {}
  }

  const handleDecline = async (project) => {
    const now = new Date().toISOString()
    const updated = potentialProjects.map(p => {
      if (p.id === project.id) {
        return { ...p, feasibility_decision_at: now, decision: 'declined' }
      }
      return p
    })
    setPotentialProjects(updated)
    localStorage.setItem('prt_potential_projects', JSON.stringify(updated))
    try {
      const ticketRes = await fetch(`${supabaseUrl}/rest/v1/project_review_tickets?tracking_id=eq.${encodeURIComponent(project.tracking_id)}&select=additional_attachments`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      })
      if (ticketRes.ok) {
        const rows = await ticketRes.json()
        const existing = rows[0]?.additional_attachments || []
        await fetch(`${supabaseUrl}/rest/v1/project_review_tickets?tracking_id=eq.${encodeURIComponent(project.tracking_id)}`, {
          method: 'PATCH',
          headers: supabaseHeaders,
          body: JSON.stringify({ additional_attachments: [...existing, { _type: 'feasibility_decision', decision: 'declined', decided_at: now }] }),
        })
      }
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
        <h3 className="text-[#1B1A1C] text-lg font-semibold mb-6">Project Phases</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stages.map((stage) => (
            <div key={stage.key} className="flex items-center gap-4">
              <div className="flex-1 flex flex-col items-center bg-gray-50 rounded-xl p-6 shadow-sm border border-[#CACDD7]/30 h-[130px] justify-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-3 ${stage.textColor}`} style={{ background: stage.gradient }}>
                  {getStageCount(stage.key)}
                </div>
                {stage.labelTop ? (
                  <span className="text-[#1B1A1C] text-sm font-medium text-center leading-tight">
                    {stage.labelTop}<br />{stage.labelBottom}
                  </span>
                ) : (
                  <span className="text-[#1B1A1C] text-sm font-medium text-center leading-tight">{stage.label}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {allProjects.length === 0 && (
          <p className="text-[#3E4048] text-sm mt-4">No projects found. Add projects to get started.</p>
        )}
      </div>

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
                    <th className="w-10 px-2 py-3"></th>
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
                    const diffDays = Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24))
                    const action = isScheduled
                      ? { text: 'Discovery Call \u2013 Scheduled', color: 'bg-green-100 text-green-700' }
                      : diffDays >= 2
                      ? { text: 'Discovery Call \u2013 Overdue (Not Scheduled)', color: 'bg-red-100 text-red-700' }
                      : { text: 'Discovery Call \u2013 Not Scheduled', color: 'bg-gray-100 text-gray-700' }
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
                      <td className="px-2 py-3">
                        {(() => {
                          return (p.notes || p.videoLink) ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setNotesProject(p); setDetailProject(null) }}
                              className="text-[#FF5900] hover:text-[#e05000] transition-colors cursor-pointer"
                              title="View documentation"
                            >
                              <Icon icon="lucide:file-text" className="w-4 h-4" />
                            </button>
                          ) : null
                        })()}
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
                <div className="pt-3 border-t border-[#CACDD7]/30 space-y-2">
                  <a
                    href={detailProject.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-[#1B1A1C] border-2 border-[#1B1A1C] w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-opacity"
                  >
                    <Icon icon="lucide:video" className="w-4 h-4" />
                    Open Google Meet
                  </a>
                  <button
                    onClick={() => { setNotesProject(detailProject); setDetailProject(null) }}
                    className="bg-white text-[#1B1A1C] border-2 border-[#1B1A1C] w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-opacity cursor-pointer"
                  >
                    <Icon icon="lucide:file-text" className="w-4 h-4" />
                    Discovery Meeting Documentation
                  </button>
                  <button
                    onClick={() => { setDecisionProject(detailProject); setDetailProject(null) }}
                    className="bg-[#1B1A1C] text-white w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Icon icon="lucide:arrow-right-circle" className="w-4 h-4" />
                    Proceed to Feasibility Decision
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {notesProject && (
        <MeetingNotesModal
          project={notesProject}
          onClose={() => setNotesProject(null)}
          onSave={saveProjectNotes}
        />
      )}

      {decisionProject && (
        <FeasibilityDecisionModal
          project={decisionProject}
          onClose={() => setDecisionProject(null)}
          onApprove={handleFeasibilityApprove}
          onDecline={handleDecline}
        />
      )}
    </div>
  )
}

export default ProjectList