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
const DISCOVERY_VIEWED_IDS_KEY = 'prt_discovery_viewed_ids'

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
        const res = await fetch(`${supabaseUrl}/rest/v1/potential_projects?tracking_id=eq.${encodeURIComponent(project.tracking_id)}&select=additional_attachments`, {
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

function getFeasibilityDay(createdAt, referenceDate) {
  if (!createdAt) return { text: 'Feasibility Review - Day 1', color: 'bg-yellow-100 text-yellow-700' }
  const ref = referenceDate ? new Date(referenceDate) : new Date()
  const diffDays = Math.floor((ref - new Date(createdAt)) / (1000 * 60 * 60 * 24))
  if (diffDays >= 3) return { text: 'Overdue: Feasibility Decision', color: 'bg-red-100 text-red-700' }
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
      setSubject(`Feasibility Decision - Accepted for ${pn} / ${tid}`)
      setHtmlBody(`${header}
            <h2 style="color:#1B1A1C;font-size:20px;margin:0 0 8px">Feasibility Decision - Accepted</h2>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 20px">Good Day Marketing,</p>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 12px">Thank you for forwarding <strong style="color:#FF5900">"${pn}"</strong>, tracking ID <strong style="color:#1B1A1C">${tid}</strong> to review.</p>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 12px">Operations has reviewed the project and the decision is <strong style="color:#16A34A">ACCEPTED</strong>.</p>
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
              Accepted
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

function InternalPlanningReadinessModal({ project, onClose, onSubmit }) {
  const [form, setForm] = useState({
    roles: [],
    teamAvailabilityConfirmed: false,
    estimatedDuration: '',
    durationUnit: 'days',
    estimatedStartDate: '',
    confidenceLevel: '',
    basisOfEstimate: '',
    risks: [],
    dependencies: '',
    clientConstraints: '',
    requiredTools: [],
    infrastructureNeeded: '',
    accessNeeded: [
      { id: 'repo', label: 'Repository Access', checked: false },
      { id: 'client_systems', label: 'Client Systems', checked: false },
      { id: 'apis', label: 'API Access', checked: false },
    ],
    customAccessItems: [],
    itConfirmation: false,
    itApproverName: '',
    decision: '',
    conditions: '',
    declineReason: '',
    opsManagerApproval: false,
    opsManagerName: '',
    opsManagerDate: '',
    cooApproval: false,
    cooName: '',
    cooDate: '',
  })

  const [sectionsExpanded, setSectionsExpanded] = useState([true, true, true, true, true])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [roleInput, setRoleInput] = useState('')
  const [toolInput, setToolInput] = useState('')
  const [customAccessInput, setCustomAccessInput] = useState('')
  const [roleOptions, setRoleOptions] = useState([])
  const [roleCounts, setRoleCounts] = useState({})
  const [roleEmployees, setRoleEmployees] = useState({})
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [openAssigneeIdx, setOpenAssigneeIdx] = useState(null)
  const [assigneeSearch, setAssigneeSearch] = useState('')

  const TOOL_OPTIONS = ['Unity', 'Unreal', 'Blender', 'Jira', 'Confluence', 'GitHub', 'Photoshop', 'Figma', 'Slack', 'Notion']

  useEffect(() => {
    const fetchRoles = async () => {
      const { data: pricing } = await supabase.from('manpower_pricing').select('role, level')
      const { data: employees } = await supabase.from('employee_master').select('position_title, full_name').eq('department_text', 'Operation')
      if (pricing) {
        const seen = new Set()
        const combined = pricing
          .filter(r => r.role && r.level)
          .filter(r => {
            const key = `${r.role}|${r.level}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
          .map(r => ({ role: r.role, level: r.level, label: `${r.role} \u2013 ${r.level}` }))
          .sort((a, b) => a.role.localeCompare(b.role) || a.level.localeCompare(b.level))
        setRoleOptions(combined)
      }
      if (employees) {
        const counts = {}
        const names = {}
        employees.forEach(e => {
          const t = e.position_title?.trim()
          if (t) {
            counts[t] = (counts[t] || 0) + 1
            if (!names[t]) names[t] = []
            if (e.full_name) names[t].push(e.full_name)
          }
        })
        setRoleCounts(counts)
        setRoleEmployees(names)
      }
    }
    fetchRoles()
  }, [])

  const toggleSection = (idx) => {
    const next = [...sectionsExpanded]
    next[idx] = !next[idx]
    setSectionsExpanded(next)
  }

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const updateNested = (field, idx, key, value) => {
    const arr = [...form[field]]
    arr[idx] = { ...arr[idx], [key]: value }
    update(field, arr)
  }

  const addRole = (roleEntry) => {
    if (!roleEntry || form.roles.some(r => r.role === roleEntry.role && r.level === roleEntry.level)) return
    update('roles', [...form.roles, { role: roleEntry.role, level: roleEntry.level, headcount: 1, assignees: '' }])
    setRoleInput('')
  }

  const removeRole = (idx) => {
    update('roles', form.roles.filter((_, i) => i !== idx))
  }

  const filteredRoles = roleOptions.filter(r => {
    const alreadyAdded = form.roles.some(fr => fr.role === r.role && fr.level === r.level)
    if (alreadyAdded) return false
    if (!roleInput.trim()) return true
    return r.label.toLowerCase().includes(roleInput.toLowerCase()) || r.role.toLowerCase().includes(roleInput.toLowerCase())
  })

  const addRisk = () => {
    update('risks', [...form.risks, { description: '', severity: 'low' }])
  }

  const removeRisk = (idx) => {
    update('risks', form.risks.filter((_, i) => i !== idx))
  }

  const addTool = (tool) => {
    if (!tool.trim() || form.requiredTools.includes(tool.trim())) return
    update('requiredTools', [...form.requiredTools, tool.trim()])
    setToolInput('')
  }

  const removeTool = (idx) => {
    update('requiredTools', form.requiredTools.filter((_, i) => i !== idx))
  }

  const addCustomAccess = () => {
    if (!customAccessInput.trim()) return
    const id = `custom_${Date.now()}`
    update('customAccessItems', [...form.customAccessItems, { id, label: customAccessInput.trim(), checked: false }])
    setCustomAccessInput('')
  }

  const removeCustomAccess = (id) => {
    update('customAccessItems', form.customAccessItems.filter(a => a.id !== id))
  }

  const toggleAccess = (id) => {
    const idx = form.accessNeeded.findIndex(a => a.id === id)
    if (idx !== -1) { updateNested('accessNeeded', idx, 'checked', !form.accessNeeded[idx].checked); return }
    const cIdx = form.customAccessItems.findIndex(a => a.id === id)
    if (cIdx !== -1) {
      const arr = [...form.customAccessItems]
      arr[cIdx] = { ...arr[cIdx], checked: !arr[cIdx].checked }
      update('customAccessItems', arr)
    }
  }

  const sectionValid = (idx) => {
    switch (idx) {
      case 0: return form.roles.length > 0 && form.teamAvailabilityConfirmed
      case 1: return form.estimatedDuration && form.estimatedStartDate && form.confidenceLevel && form.basisOfEstimate
      case 2: return true
      case 3: return form.requiredTools.length > 0 && form.itConfirmation && form.itApproverName
      case 4:
        if (!form.decision) return false
        if (!form.opsManagerApproval || !form.opsManagerName || !form.opsManagerDate) return false
        if (!form.cooApproval || !form.cooName || !form.cooDate) return false
        if (form.decision === 'conditions' && !form.conditions) return false
        if (form.decision === 'decline' && !form.declineReason) return false
        return true
      default: return false
    }
  }

  const completedSections = sectionsExpanded.map((_, i) => sectionValid(i) ? 1 : 0).reduce((a, b) => a + b, 0)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(project, form)
      onClose()
    } catch (e) {
      setError(e.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const sectionHeader = (idx, title, icon) => (
    <button
      type="button"
      onClick={() => toggleSection(idx)}
      className="w-full flex items-center justify-between py-4 px-5 bg-white rounded-lg cursor-pointer group"
    >
      <div className="flex items-center gap-2">
        <Icon icon={icon} className="w-4 h-4 text-[#FF5900]" />
        <span className="text-sm font-semibold text-[#1B1A1C]">{title}</span>
        {sectionValid(idx) && <Icon icon="lucide:check-circle" className="w-3.5 h-3.5 text-green-600" />}
      </div>
      <Icon icon={sectionsExpanded[idx] ? 'lucide:chevron-up' : 'lucide:chevron-down'} className="w-4 h-4 text-[#3E4048]" />
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-2 flex-shrink-0">
          <div>
            <h3 className="text-[#1B1A1C] text-lg font-bold">Internal Planning & Readiness</h3>
            <p className="text-xs text-[#3E4048] mt-1.5">
              {project.tracking_id} &middot; {project.client_name} &middot; {project.project_name}
            </p>
          </div>
          <button onClick={onClose} className="text-[#3E4048] hover:text-[#1B1A1C] cursor-pointer">
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-1 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-[#FF5900] h-2 rounded-full transition-all" style={{ width: `${(completedSections / 5) * 100}%` }} />
            </div>
            <span className="text-xs text-[#3E4048] font-medium whitespace-nowrap">{completedSections} of 5 sections complete</span>
          </div>
        </div>

        <div className="overflow-y-auto p-6 pt-5 space-y-5 flex-1">
          {/* SECTION 1 */}
          <div className="border border-[#CACDD7]/30 rounded-xl bg-[#F9FAFB]">
            {sectionHeader(0, 'Resource Planning', 'lucide:users')}
            {sectionsExpanded[0] && (
              <div className="px-5 pb-5 space-y-4">
<div>
                    <label className="text-[#1B1A1C] text-sm font-medium mb-1.5 block">Roles Needed *</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {form.roles.map((r, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-[#1B1A1C] text-white text-xs font-medium px-2.5 py-1 rounded-full">
                          {r.role} &ndash; {r.level}
                          <button onClick={() => removeRole(i)} className="hover:text-red-300 cursor-pointer">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <Icon icon="lucide:plus-circle" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3E4048] pointer-events-none" />
                          <input
                            value={roleInput}
                            onChange={e => { setRoleInput(e.target.value); setShowRoleDropdown(true) }}
                            onFocus={() => setShowRoleDropdown(true)}
                            onBlur={() => setTimeout(() => setShowRoleDropdown(false), 200)}
                            onKeyDown={e => { if (e.key === 'Enter' && filteredRoles.length === 1) { e.preventDefault(); addRole(filteredRoles[0]) } }}
                            placeholder="Add a role..."
                            className="w-full pl-8 pr-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]"
                          />
                        </div>
                      </div>
                      {showRoleDropdown && filteredRoles.length > 0 && (
                        <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-[#CACDD7] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredRoles.map(entry => (
                            <button
                              key={`${entry.role}|${entry.level}`}
                              onClick={() => { addRole(entry); setShowRoleDropdown(false) }}
                              className="w-full text-left px-3 py-2 text-sm text-[#1B1A1C] hover:bg-orange-50 flex items-center justify-between cursor-pointer"
                            >
                              <span>{entry.label}</span>
                              <span className="text-xs text-[#3E4048]">{roleCounts[entry.role] || 0} available</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                {form.roles.map((r, i) => {
                  const available = roleCounts[r.role] || 0
                  const insufficient = available === 0 || r.headcount > available
                  return (
                  <div key={i} className={`grid grid-cols-[1fr_80px_1fr] gap-3 items-start p-3 rounded-lg ${insufficient ? 'bg-gray-100' : ''}`}>
                    <div className="flex items-center gap-2 pt-1.5">
                      <span className="text-sm font-medium text-[#1B1A1C]">{r.role} &ndash; {r.level}</span>
                      <span className="text-xs text-[#3E4048]">({available} avail)</span>
                      {insufficient && (
                        <span className="text-xs text-amber-600 flex items-center gap-1" title="Not enough manpower for this role">
                          <Icon icon="lucide:alert-triangle" className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] text-[#3E4048] font-medium block mb-1">Qty</label>
                      <input type="number" min="1" value={r.headcount} onChange={e => updateNested('roles', i, 'headcount', parseInt(e.target.value) || 1)} className="w-full px-3 py-1.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#3E4048] font-medium block mb-1">Assignee</label>
                      {available === 0 ? (
                        <input value="No Manpower" disabled className="w-full px-3 py-1.5 border border-[#CACDD7] rounded-lg text-sm bg-gray-100 text-[#3E4048] cursor-not-allowed" />
                      ) : (
                        <div className="relative">
                          <input
                            value={openAssigneeIdx === i ? assigneeSearch : r.assignees}
                            onChange={e => { setAssigneeSearch(e.target.value); setOpenAssigneeIdx(i) }}
                            onFocus={() => { setAssigneeSearch(''); setOpenAssigneeIdx(i) }}
                            onBlur={() => setTimeout(() => setOpenAssigneeIdx(null), 200)}
                            placeholder="Select Manpower"
                            className="w-full px-3 py-1.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]"
                          />
                          {openAssigneeIdx === i && (
                            <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-[#CACDD7] rounded-lg shadow-lg max-h-36 overflow-y-auto">
                              {(roleEmployees[r.role] || [])
                                .filter(name => !assigneeSearch || name.toLowerCase().includes(assigneeSearch.toLowerCase()))
                                .map(name => (
                                  <button
                                    key={name}
                                    onClick={() => {
                                      const current = r.assignees ? r.assignees.split(', ').filter(Boolean) : []
                                      const updated = current.includes(name) ? current.filter(n => n !== name) : [...current, name]
                                      updateNested('roles', i, 'assignees', updated.join(', '))
                                      setAssigneeSearch('')
                                      setOpenAssigneeIdx(null)
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-orange-50 cursor-pointer flex items-center gap-2 ${
                                      r.assignees?.split(', ').includes(name) ? 'bg-orange-50 font-medium' : ''
                                    }`}
                                  >
                                    <Icon icon={r.assignees?.split(', ').includes(name) ? 'lucide:check-square' : 'lucide:square'} className="w-3.5 h-3.5 text-[#3E4048]" />
                                    {name}
                                  </button>
                                ))}
                              {(roleEmployees[r.role] || []).filter(name => !assigneeSearch || name.toLowerCase().includes(assigneeSearch.toLowerCase())).length === 0 && (
                                <div className="px-3 py-2 text-xs text-[#3E4048]">No matching employees</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {insufficient && (
                      <div className="col-span-3 text-xs text-amber-600 flex items-center justify-between -mt-1">
                        <div className="flex items-center gap-1">
                          <Icon icon="lucide:alert-triangle" className="w-3 h-3" />
                          Not enough manpower available for this role. Needed {r.headcount}, only {available} available.
                        </div>
                        <a
                          href="https://hr.exodiagamedev.com/haf-form"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-white bg-[#FF5900] px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity no-underline"
                        >
                          <Icon icon="lucide:external-link" className="w-3 h-3" />
                          HAF
                        </a>
                      </div>
                    )}
                  </div>
                  )
                })}
                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                  <input type="checkbox" checked={form.teamAvailabilityConfirmed} onChange={e => update('teamAvailabilityConfirmed', e.target.checked)} className="accent-[#FF5900] w-4 h-4" />
                  <span className="text-sm text-[#1B1A1C]">Team Availability Confirmed *</span>
                </label>
              </div>
            )}
          </div>

          {/* SECTION 2 */}
          <div className="border border-[#CACDD7]/30 rounded-xl bg-[#F9FAFB]">
            {sectionHeader(1, 'Preliminary Timeline Estimate', 'lucide:calendar')}
            {sectionsExpanded[1] && (
              <div className="px-5 pb-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#1B1A1C] text-sm font-medium mb-1.5 block">Estimated Duration *</label>
                    <div className="flex gap-2">
                      <input type="number" min="1" value={form.estimatedDuration} onChange={e => update('estimatedDuration', e.target.value)} className="w-24 px-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]" />
                      <select value={form.durationUnit} onChange={e => update('durationUnit', e.target.value)} className="px-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900] bg-white">
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Estimated Start Date *</label>
                    <input type="date" value={form.estimatedStartDate} onChange={e => update('estimatedStartDate', e.target.value)} className="w-full px-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]" />
                  </div>
                </div>
                <div>
                  <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Confidence Level *</label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => update('confidenceLevel', l)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                          form.confidenceLevel === l
                            ? 'bg-[#1B1A1C] text-white border-[#1B1A1C]'
                            : 'bg-white text-[#3E4048] border-[#CACDD7] hover:bg-gray-50'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Basis of Estimate *</label>
                  <textarea value={form.basisOfEstimate} onChange={e => update('basisOfEstimate', e.target.value)} rows={2} placeholder="Describe how this estimate was derived" className="w-full px-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900] resize-none" />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed">
                  This is a preliminary estimate. Final timeline will be locked after client submits detailed requirements.
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3 */}
          <div className="border border-[#CACDD7]/30 rounded-xl bg-[#F9FAFB]">
            {sectionHeader(2, 'Risks & Constraints', 'lucide:alert-triangle')}
            {sectionsExpanded[2] && (
              <div className="px-5 pb-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#1B1A1C] text-sm font-medium">Known Risks</label>
                    <button onClick={addRisk} type="button" className="text-xs text-[#FF5900] font-medium hover:underline cursor-pointer">+ Add Risk</button>
                  </div>
                  {form.risks.length === 0 && <p className="text-xs text-[#3E4048]">No risks added yet.</p>}
                  {form.risks.map((r, i) => (
                    <div key={i} className="flex gap-2 items-start mt-2">
                      <input value={r.description} onChange={e => updateNested('risks', i, 'description', e.target.value)} placeholder="Describe the risk" className="flex-1 px-3 py-1.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]" />
                      <select value={r.severity} onChange={e => updateNested('risks', i, 'severity', e.target.value)} className="px-2 py-1.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900] bg-white">
                        <option value="low">Low</option>
                        <option value="med">Med</option>
                        <option value="high">High</option>
                      </select>
                      <button onClick={() => removeRisk(i)} className="text-red-500 hover:text-red-700 px-2 cursor-pointer">&times;</button>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Dependencies (optional)</label>
                  <textarea value={form.dependencies} onChange={e => update('dependencies', e.target.value)} rows={2} placeholder="List any dependencies" className="w-full px-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900] resize-none" />
                </div>
                <div>
                  <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Client-Side Constraints (optional)</label>
                  <textarea value={form.clientConstraints} onChange={e => update('clientConstraints', e.target.value)} rows={2} placeholder="List any client constraints" className="w-full px-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900] resize-none" />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4 */}
          <div className="border border-[#CACDD7]/30 rounded-xl bg-[#F9FAFB]">
            {sectionHeader(3, 'Tools & System Requirements', 'lucide:wrench')}
            {sectionsExpanded[3] && (
              <div className="px-5 pb-5 space-y-4">
                <div>
                  <label className="text-[#1B1A1C] text-sm font-medium mb-1.5 block">Required Tools / Licenses *</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.requiredTools.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-[#1B1A1C] text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        {t}
                        <button onClick={() => removeTool(i)} className="hover:text-red-300 cursor-pointer">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={toolInput}
                      onChange={e => setToolInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTool(toolInput) } }}
                      placeholder="Type a tool and press Enter"
                      className="flex-1 px-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]"
                    />
                    <button onClick={() => addTool(toolInput)} className="text-[#FF5900] text-sm font-medium px-3 py-2 hover:bg-orange-50 rounded-lg cursor-pointer">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {TOOL_OPTIONS.filter(o => !form.requiredTools.includes(o)).map(o => (
                      <button key={o} onClick={() => addTool(o)} className="text-xs text-[#3E4048] border border-[#CACDD7] px-2 py-0.5 rounded-full hover:bg-gray-100 cursor-pointer">{o}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Infrastructure Needed (optional)</label>
                  <textarea value={form.infrastructureNeeded} onChange={e => update('infrastructureNeeded', e.target.value)} rows={2} placeholder="Describe infrastructure requirements" className="w-full px-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900] resize-none" />
                </div>
                <div>
                  <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Access Needed</label>
                  <div className="space-y-1.5">
                    {[...form.accessNeeded, ...form.customAccessItems].map(a => (
                      <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={a.checked} onChange={() => toggleAccess(a.id)} className="accent-[#FF5900] w-4 h-4" />
                        <span className="text-sm text-[#1B1A1C]">{a.label}</span>
                        {a.id.startsWith('custom_') && (
                          <button onClick={() => removeCustomAccess(a.id)} className="text-red-400 hover:text-red-600 text-xs ml-1 cursor-pointer">&times;</button>
                        )}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      value={customAccessInput}
                      onChange={e => setCustomAccessInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAccess() } }}
                      placeholder="Add custom access item"
                      className="flex-1 px-3 py-1.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]"
                    />
                    <button onClick={addCustomAccess} className="text-[#FF5900] text-sm font-medium px-3 hover:bg-orange-50 rounded-lg cursor-pointer">Add</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.itConfirmation} onChange={e => update('itConfirmation', e.target.checked)} className="accent-[#FF5900] w-4 h-4" />
                    <span className="text-sm text-[#1B1A1C]">IT Confirmation *</span>
                  </label>
                  {form.itConfirmation && (
                    <input
                      value={form.itApproverName}
                      onChange={e => update('itApproverName', e.target.value)}
                      placeholder="IT Approver Name *"
                      className="w-full px-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5 */}
          <div className="border border-[#CACDD7]/30 rounded-xl bg-[#F9FAFB]">
            {sectionHeader(4, 'Readiness Decision (Go/No-Go)', 'lucide:flag')}
            {sectionsExpanded[4] && (
              <div className="px-5 pb-5 space-y-4">
                <div>
                  <label className="text-[#1B1A1C] text-sm font-medium mb-3 block">Decision *</label>
                  <div className="space-y-2">
                    {[
                      { value: 'proceed', label: 'Proceed as-is', icon: 'lucide:check-circle', color: 'text-green-600' },
                      { value: 'conditions', label: 'Proceed with Conditions', icon: 'lucide:alert-circle', color: 'text-amber-600' },
                      { value: 'decline', label: 'Decline', icon: 'lucide:x-circle', color: 'text-red-600' },
                    ].map(opt => (
                      <label key={opt.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        form.decision === opt.value ? 'border-[#FF5900] bg-orange-50' : 'border-[#CACDD7] hover:bg-gray-50'
                      }`}>
                        <input type="radio" name="decision" value={opt.value} checked={form.decision === opt.value} onChange={e => update('decision', e.target.value)} className="accent-[#FF5900]" />
                        <Icon icon={opt.icon} className={`w-4 h-4 ${opt.color}`} />
                        <span className="text-sm font-medium text-[#1B1A1C]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {form.decision === 'conditions' && (
                  <div>
                    <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Conditions *</label>
                    <textarea value={form.conditions} onChange={e => update('conditions', e.target.value)} rows={3} placeholder="Describe the conditions for proceeding" className="w-full px-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900] resize-none" />
                  </div>
                )}
                {form.decision === 'decline' && (
                  <div>
                    <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Decline Reason *</label>
                    <textarea value={form.declineReason} onChange={e => update('declineReason', e.target.value)} rows={3} placeholder="Explain why this project is being declined" className="w-full px-3 py-2 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900] resize-none" />
                  </div>
                )}
                <div className="border-t border-[#CACDD7]/30 pt-3 space-y-3">
                  <p className="text-sm font-semibold text-[#1B1A1C]">Approvals</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2 border border-[#CACDD7]/30 rounded-lg p-3 bg-white">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.opsManagerApproval} onChange={e => update('opsManagerApproval', e.target.checked)} className="accent-[#FF5900] w-4 h-4" />
                        <span className="text-sm font-medium text-[#1B1A1C]">Ops Manager *</span>
                      </label>
                      {form.opsManagerApproval && (
                        <div className="space-y-2">
                          <input value={form.opsManagerName} onChange={e => update('opsManagerName', e.target.value)} placeholder="Name *" className="w-full px-3 py-1.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]" />
                          <input type="date" value={form.opsManagerDate} onChange={e => update('opsManagerDate', e.target.value)} className="w-full px-3 py-1.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 border border-[#CACDD7]/30 rounded-lg p-3 bg-white">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.cooApproval} onChange={e => update('cooApproval', e.target.checked)} className="accent-[#FF5900] w-4 h-4" />
                        <span className="text-sm font-medium text-[#1B1A1C]">COO *</span>
                      </label>
                      {form.cooApproval && (
                        <div className="space-y-2">
                          <input value={form.cooName} onChange={e => update('cooName', e.target.value)} placeholder="Name *" className="w-full px-3 py-1.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]" />
                          <input type="date" value={form.cooDate} onChange={e => update('cooDate', e.target.value)} className="w-full px-3 py-1.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="px-6 pb-2 flex-shrink-0">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[#CACDD7]/30 flex-shrink-0">
          <button onClick={onClose} className="text-[#3E4048] text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={![0, 1, 2, 3, 4].every(i => sectionValid(i)) || submitting}
            className="bg-[#1B1A1C] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProjectList() {
  const [potentialProjects, setPotentialProjects] = useState([])
  const [approvedProjects, setApprovedProjects] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('leads')
  const [detailProject, setDetailProject] = useState(null)
  const [detailDecidedProject, setDetailDecidedProject] = useState(null)
  const [notesProject, setNotesProject] = useState(null)
  const [decisionProject, setDecisionProject] = useState(null)
  const [planningProject, setPlanningProject] = useState(null)
  const [discoveryViewedIds, setDiscoveryViewedIds] = useState(() => JSON.parse(localStorage.getItem(DISCOVERY_VIEWED_IDS_KEY) || '[]'))

  const qualifiedLeads = potentialProjects.filter(p => p.decision === 'accepted')
  const archivedLeads = potentialProjects.filter(p => p.decision === 'declined')
  const activeLeads = potentialProjects.filter(p => p.decision !== 'accepted' && p.decision !== 'declined')

  const saveProjectNotes = (trackingId, data) => {
    const updated = potentialProjects.map(p => {
      if (p.tracking_id === trackingId) {
        return { ...p, notes: data.notes, videoLink: data.videoLink }
      }
      return p
    })
    setPotentialProjects(updated)
    supabase.from('potential_projects').update({ additional_attachments: [{ _type: 'meeting_notes', notes: data.notes, videoLink: data.videoLink }] }).eq('tracking_id', trackingId)
  }

  const markDiscoveryViewed = (id) => {
    if (discoveryViewedIds.includes(id)) return
    const updated = [...discoveryViewedIds, id]
    setDiscoveryViewedIds(updated)
    localStorage.setItem(DISCOVERY_VIEWED_IDS_KEY, JSON.stringify(updated))
  }

  const handleFeasibilityApprove = async (project) => {
    const now = new Date().toISOString()
    const updated = potentialProjects.map(p => {
      if (p.id === project.id) {
        return { ...p, feasibility_decision_at: now, decision: 'accepted', pillar: 'Discovery' }
      }
      return p
    })
    setPotentialProjects(updated)
    await supabase.from('potential_projects').update({ status: 'feasibility_accepted', phase: 'initiation', decision: 'accepted', feasibility_decision_at: now, pillar: 'Discovery' }).eq('id', project.id)
    const { data } = await supabase.from('projects').select('*').eq('status', 'approved').order('created_at', { ascending: false })
    if (data) setApprovedProjects(data)
  }

  useEffect(() => {
    fetchAll()
    fetchAllProjects()
    ;(async () => {
      const { data: accepted } = await supabase.from('potential_projects').select('*').eq('decision', 'accepted').neq('pillar', 'Discovery')
      if (accepted && accepted.length > 0) {
        const ids = accepted.map(p => p.id)
        await supabase.from('potential_projects').update({ pillar: 'Discovery' }).in('id', ids)
        fetchAll()
      }
    })()
    const handler = async () => {
      try {
        const { data, error } = await supabase.from('potential_projects').select('*').order('created_at', { ascending: false })
        const { data: approvedData } = await supabase.from('projects').select('*').eq('status', 'approved').order('created_at', { ascending: false })
        if (!error && data) {
          setPotentialProjects(data.filter(p => p.status === 'leads' || p.status === 'discovery_scheduled' || p.status === 'feasibility_accepted' || p.status === 'feasibility_declined'))
          if (approvedData) setApprovedProjects(approvedData)
        }
      } catch {}
    }
    window.addEventListener('prt-projects-updated', handler)
    return () => {
      window.removeEventListener('prt-projects-updated', handler)
    }
  }, [])

  const fetchAll = async () => {
    try {
      const { data, error } = await supabase.from('potential_projects').select('*').order('created_at', { ascending: false })
      const { data: approvedData } = await supabase.from('projects').select('*').eq('status', 'approved').order('created_at', { ascending: false })
      if (!error && data) {
        setPotentialProjects(data.filter(p => p.status === 'leads' || p.status === 'discovery_scheduled' || p.status === 'feasibility_accepted' || p.status === 'feasibility_declined'))
        if (approvedData) setApprovedProjects(approvedData)
      }
    } catch {} finally {
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
    const all = [...allProjects, ...potentialProjects]
    return all.filter(p => {
      const phase = (p.phase || '').toLowerCase()
      const stage = (p.stage || p.current_stage || '').toLowerCase()
      const status = (p.status || '').toLowerCase()
      if (stageKey === 'initiation') {
        if (p.decision === 'declined') return false
        if (p.decision === 'accepted') return phase === 'initiation' || phase === ''
        if (p.decision === undefined && p.createdAt !== undefined) return true
        return phase === 'initiation' || stage === 'initiation' || stage === 'concept'
      }
      const s = stage || status || phase
      if (stageKey === 'pre-production') return s.includes('pre') || s.includes('preproduction')
      if (stageKey === 'production') return s === 'production' || s.includes('production')
      if (stageKey === 'post-production') return s.includes('post') || s.includes('qa') || s.includes('final')
      if (stageKey === 'service-ops') return s.includes('service') || s.includes('live') || s.includes('ops')
      if (stageKey === 'close-out') return s.includes('close') || s.includes('complete') || s.includes('done')
      return false
    }).length
  }

  const handleApprove = async (project) => {
    const now = new Date().toISOString()
    const updated = potentialProjects.map(p => {
      if (p.id === project.id) {
        return { ...p, feasibility_decision_at: now, decision: 'accepted', pillar: 'Discovery' }
      }
      return p
    })
    setPotentialProjects(updated)
    const { data, error } = await supabase
      .from('potential_projects')
      .update({ status: 'feasibility_accepted', phase: 'initiation', decision: 'accepted', feasibility_decision_at: now, pillar: 'Discovery' })
      .eq('id', project.id)
      .select()
    if (!error && data) {
      const { data: approvedData } = await supabase.from('projects').select('*').eq('status', 'approved').order('created_at', { ascending: false })
      if (approvedData) setApprovedProjects(approvedData)
    }
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
    await supabase.from('potential_projects').update({ status: 'feasibility_declined', decision: 'declined', feasibility_decision_at: now, feasibility_status: 'declined' }).eq('id', project.id)
  }

  const handlePlanningSubmit = async (project, form) => {
    console.log('Internal Planning & Readiness submitted', { project, form })
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
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-[#1B1A1C] text-xl font-semibold">Project List</h2>
            <p className="text-[#3E4048] text-sm">Manage potential and approved projects</p>
          </div>
          <button
            onClick={() => setTab('archived')}
            className="text-[#3E4048] hover:text-[#1B1A1C] transition-colors cursor-pointer"
            title="View Archived"
          >
            <Icon icon="lucide:archive" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('leads')}
            className={`flex-1 rounded-xl px-5 py-4 text-left transition-all cursor-pointer ${
              tab === 'leads' ? 'bg-amber-50 border-2 border-amber-300' : 'bg-amber-50/50 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <p className="text-amber-700 text-xs font-medium uppercase tracking-wider">Leads</p>
            <p className="text-amber-900 text-3xl font-bold mt-1">{activeLeads.length}</p>
          </button>
          <button
            onClick={() => setTab('qualified')}
            className={`flex-1 rounded-xl px-5 py-4 text-left transition-all cursor-pointer ${
              tab === 'qualified' ? 'bg-orange-50 border-2 border-orange-300' : 'bg-orange-50/50 border border-orange-200 hover:bg-orange-50'
            }`}
          >
            <p className="text-orange-700 text-xs font-medium uppercase tracking-wider">Qualified Leads</p>
            <p className="text-orange-900 text-3xl font-bold mt-1">{qualifiedLeads.length}</p>
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

        {tab === 'leads' && activeLeads.length > 0 && (
          <div>
            <h3 className="text-[#1B1A1C] text-base font-semibold mb-3 flex items-center gap-2">
              <Icon icon="lucide:clock" className="w-4 h-4 text-amber-600" />
              Leads
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
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Phase</th>
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Pillar</th>
                    <th className="w-10 px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeLeads
                  .sort((a, b) => {
                    if (a.status === 'discovery_scheduled' && b.status !== 'discovery_scheduled') return -1
                    if (a.status !== 'discovery_scheduled' && b.status === 'discovery_scheduled') return 1
                    return 0
                  })
                  .map(p => {
                    const isScheduled = p.status === 'discovery_scheduled'
                    const day = getFeasibilityDay(p.createdAt)
                    const diffDays = Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24))
                    const isUnreadDiscovery = isScheduled && !discoveryViewedIds.includes(p.id)
                    const action = isScheduled
                      ? { text: 'Discovery Call \u2013 Scheduled', color: 'bg-green-100 text-green-700' }
                      : diffDays >= 2
                      ? { text: 'Discovery Call \u2013 Overdue (Not Scheduled)', color: 'bg-red-100 text-red-700' }
                      : { text: 'Discovery Call \u2013 Not Scheduled', color: 'bg-gray-100 text-gray-700' }
                    return (
                    <tr
                      key={p.id}
                      onClick={() => {
                        if (isScheduled) {
                          markDiscoveryViewed(p.id)
                          setDetailProject(p)
                        } else if (p.decision === 'accepted' || p.decision === 'declined') {
                          setDetailDecidedProject(p)
                        }
                      }}
                      className={`border-b border-[#CACDD7]/50 transition-colors ${
                        isScheduled || p.decision === 'declined' || p.decision === 'accepted' ? 'hover:bg-green-50 cursor-pointer' : 'hover:bg-amber-50/50'
                      }`}
                    >
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap text-xs font-mono">{p.tracking_id || '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden md:table-cell">{p.client_name || '-'}</td>
                      <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap">{p.project_name || 'Untitled'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.sent_at ? formatDateTime(p.sent_at) : '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.createdAt ? formatDateTime(p.createdAt) : 'Today'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {p.decision === 'accepted' ? (
<span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FF5900] text-white">Feasibility - Accepted</span>
                          ) : p.decision === 'declined' ? (
                            <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-600 text-white">Feasibility - Decline</span>
                          ) : (
                            <>
                              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${day.color}`}>
                                {day.text}
                              </span>
                              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${action.color} relative`}>
                                {action.text}
                                {isUnreadDiscovery && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full text-[#1B1A1C]" style={{background: 'linear-gradient(135deg, #ffffff, #d4d4d8)'}}>{p.phase ? p.phase.charAt(0).toUpperCase() + p.phase.slice(1) : 'Initiation'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs ${p.pillar ? 'text-[#1B1A1C] font-semibold' : 'text-[#CACDD7]'}`}>{p.pillar || '-'}</span>
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

        {tab === 'leads' && activeLeads.length === 0 && (
          <div className="text-center py-12">
            <Icon icon="lucide:clock" className="w-10 h-10 text-[#CACDD7] mx-auto mb-3" />
            <p className="text-[#3E4048] text-sm">No leads yet.</p>
          </div>
        )}

        {tab === 'qualified' && qualifiedLeads.length > 0 && (
          <div>
            <h3 className="text-[#1B1A1C] text-base font-semibold mb-3 flex items-center gap-2">
              <Icon icon="lucide:check-circle" className="w-4 h-4 text-orange-600" />
              Qualified Leads
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
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Phase</th>
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Pillar</th>
                    <th className="w-10 px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {qualifiedLeads
                  .sort((a, b) => {
                    if (a.status === 'discovery_scheduled' && b.status !== 'discovery_scheduled') return -1
                    if (a.status !== 'discovery_scheduled' && b.status === 'discovery_scheduled') return 1
                    return 0
                  })
                  .map(p => {
                    const isScheduled = p.status === 'discovery_scheduled'
                    const day = getFeasibilityDay(p.createdAt)
                    const diffDays = Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24))
                    return (
                    <tr
                      key={p.id}
                      onClick={() => setDetailDecidedProject(p)}
                      className="border-b border-[#CACDD7]/50 hover:bg-orange-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap text-xs font-mono">{p.tracking_id || '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden md:table-cell">{p.client_name || '-'}</td>
                      <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap">{p.project_name || 'Untitled'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.sent_at ? formatDateTime(p.sent_at) : '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.createdAt ? formatDateTime(p.createdAt) : 'Today'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FF5900] text-white">Feasibility - Accepted</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full text-[#1B1A1C]" style={{background: 'linear-gradient(135deg, #ffffff, #d4d4d8)'}}>{p.phase ? p.phase.charAt(0).toUpperCase() + p.phase.slice(1) : 'Initiation'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs ${p.pillar ? 'text-[#1B1A1C] font-semibold' : 'text-[#CACDD7]'}`}>{p.pillar || '-'}</span>
                      </td>
                      <td className="px-2 py-3">
                        {(() => {
                          return (p.notes || p.videoLink) ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setNotesProject(p) }}
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

        {tab === 'qualified' && qualifiedLeads.length === 0 && (
          <div className="text-center py-12">
            <Icon icon="lucide:check-circle" className="w-10 h-10 text-[#CACDD7] mx-auto mb-3" />
            <p className="text-[#3E4048] text-sm">No qualified leads yet.</p>
          </div>
        )}

        {tab === 'archived' && archivedLeads.length > 0 && (
          <div>
            <h3 className="text-[#1B1A1C] text-base font-semibold mb-3 flex items-center gap-2">
              <Icon icon="lucide:archive" className="w-4 h-4 text-gray-600" />
              Archived
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
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Phase</th>
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Pillar</th>
                    <th className="w-10 px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {archivedLeads
                  .sort((a, b) => {
                    if (a.status === 'discovery_scheduled' && b.status !== 'discovery_scheduled') return -1
                    if (a.status !== 'discovery_scheduled' && b.status === 'discovery_scheduled') return 1
                    return 0
                  })
                  .map(p => {
                    const isScheduled = p.status === 'discovery_scheduled'
                    const day = getFeasibilityDay(p.createdAt)
                    const diffDays = Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24))
                    return (
                    <tr
                      key={p.id}
                      onClick={() => setDetailDecidedProject(p)}
                      className="border-b border-[#CACDD7]/50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap text-xs font-mono">{p.tracking_id || '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden md:table-cell">{p.client_name || '-'}</td>
                      <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap">{p.project_name || 'Untitled'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.sent_at ? formatDateTime(p.sent_at) : '-'}</td>
                      <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{p.createdAt ? formatDateTime(p.createdAt) : 'Today'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-600 text-white">Feasibility - Decline</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full text-[#1B1A1C]" style={{background: 'linear-gradient(135deg, #ffffff, #d4d4d8)'}}>{p.phase ? p.phase.charAt(0).toUpperCase() + p.phase.slice(1) : 'Initiation'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs ${p.pillar ? 'text-[#1B1A1C] font-semibold' : 'text-[#CACDD7]'}`}>{p.pillar || '-'}</span>
                      </td>
                      <td className="px-2 py-3">
                        {(() => {
                          return (p.notes || p.videoLink) ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setNotesProject(p) }}
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

        {tab === 'archived' && archivedLeads.length === 0 && (
          <div className="text-center py-12">
            <Icon icon="lucide:archive" className="w-10 h-10 text-[#CACDD7] mx-auto mb-3" />
            <p className="text-[#3E4048] text-sm">No archived projects.</p>
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
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Phase</th>
                    <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Pillar</th>
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full text-[#1B1A1C]" style={{background: 'linear-gradient(135deg, #ffffff, #d4d4d8)'}}>{p.phase ? p.phase.charAt(0).toUpperCase() + p.phase.slice(1) : 'Initiation'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs ${p.pillar ? 'text-[#1B1A1C] font-semibold' : 'text-[#CACDD7]'}`}>{p.pillar || '-'}</span>
                      </td>
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
              {detailProject.meet_link && (
                <div className="pt-3 border-t border-[#CACDD7]/30 space-y-2">
                  <a
                    href={detailProject.meet_link}
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

      {detailDecidedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetailDecidedProject(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1B1A1C] text-lg font-bold">Project Details</h3>
              <button onClick={() => setDetailDecidedProject(null)} className="text-[#3E4048] hover:text-[#1B1A1C] cursor-pointer">
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-6">
              <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-3">
                <span className="text-sm text-[#3E4048] font-medium">Tracking ID</span>
                <span className="text-sm text-[#1B1A1C] font-semibold font-mono">{detailDecidedProject.tracking_id || '-'}</span>

                <span className="text-sm text-[#3E4048] font-medium">Client</span>
                <span className="text-sm text-[#1B1A1C] font-semibold">{detailDecidedProject.client_name || '-'}</span>

                <span className="text-sm text-[#3E4048] font-medium">Project</span>
                <span className="text-sm text-[#1B1A1C] font-semibold">{detailDecidedProject.project_name || 'Untitled'}</span>

                <span className="text-sm text-[#3E4048] font-medium">Received</span>
                <span className="text-sm text-[#1B1A1C] font-semibold">{detailDecidedProject.sent_at ? formatDateTime(detailDecidedProject.sent_at) : '-'}</span>
              </div>

              <div className="border-t border-[#CACDD7]/30 mt-4 pt-4">
                <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-3">
                  {(() => {
                    const refDate = detailDecidedProject.feasibility_decision_at || new Date().toISOString()
                    const origDay = getFeasibilityDay(detailDecidedProject.createdAt, refDate)
                    return (
                      <>
                        <span className="text-sm text-[#3E4048] font-medium">Feasibility Started</span>
                        <span className="text-sm text-[#1B1A1C] font-semibold">{detailDecidedProject.createdAt ? formatDateTime(detailDecidedProject.createdAt) : 'Today'}</span>
                        <span className="text-sm text-[#3E4048] font-medium">Feasibility Status</span>
                        <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${origDay.color} w-fit`}>{origDay.text}</span>
                      </>
                    )
                  })()}
                  {(() => {
                    const refDate = detailDecidedProject.feasibility_decision_at || new Date().toISOString()
                    const ref = new Date(refDate)
                    const diffDays = Math.floor((ref - new Date(detailDecidedProject.createdAt)) / (1000 * 60 * 60 * 24))
                    const isScheduled = detailDecidedProject.status === 'discovery_scheduled'
                    const isOverdue = !isScheduled && diffDays >= 2
                    const disLabel = isScheduled ? 'Discovery Call \u2013 Scheduled' : isOverdue ? 'Discovery Call \u2013 Overdue (Not Scheduled)' : 'Discovery Call \u2013 Not Scheduled'
                    const disColor = isScheduled ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    return (
                      <>
                        <span className="text-sm text-[#3E4048] font-medium">Discovery Call</span>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm text-[#1B1A1C] font-semibold">{detailDecidedProject.discovery_scheduled_at ? formatDateTime(detailDecidedProject.discovery_scheduled_at) : detailDecidedProject.meet_link ? 'Scheduled' : 'Not Scheduled'}</span>
                          <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${disColor}`}>{disLabel}</span>
                        </div>
                      </>
                    )
                  })()}
                  {detailDecidedProject.feasibility_decision_at && (() => {
                    const ref = new Date(detailDecidedProject.feasibility_decision_at)
                    const diffDays = Math.floor((ref - new Date(detailDecidedProject.createdAt)) / (1000 * 60 * 60 * 24))
                    return (
                      <>
                        <span className="text-sm text-[#3E4048] font-medium">Feasibility Decision</span>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm text-[#1B1A1C] font-semibold">{formatDateTime(detailDecidedProject.feasibility_decision_at)}</span>
                          {diffDays >= 3 ? (
                            <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">Overdue: Feasibility Decision</span>
                          ) : detailDecidedProject.decision === 'accepted' ? (
                            <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">Feasibility Decision - Accepted</span>
                          ) : (
                            <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">Feasibility Decision - Decline</span>
                          )}
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              <div className="border-t border-[#CACDD7]/30 mt-4 pt-4">
                <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-3">
                  <span className="text-sm text-[#3E4048] font-medium">Status</span>
                  {detailDecidedProject.decision === 'accepted' ? (
                    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#FF5900] text-white w-fit">Feasibility - Accepted</span>
                  ) : (
                    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 w-fit">Feasibility - Decline</span>
                  )}
                </div>
              </div>

              {detailDecidedProject.decision === 'accepted' && (
                <div className="border-t border-[#CACDD7]/30 mt-4 pt-4">
                  <button
                    onClick={() => { setPlanningProject(detailDecidedProject); setDetailDecidedProject(null) }}
                    className="bg-[#1B1A1C] text-white w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Icon icon="lucide:arrow-right-circle" className="w-4 h-4" />
                    Proceed to Internal Planning & Readiness
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

      {planningProject && (
        <InternalPlanningReadinessModal
          project={planningProject}
          onClose={() => setPlanningProject(null)}
          onSubmit={handlePlanningSubmit}
        />
      )}
    </div>
  )
}

export default ProjectList