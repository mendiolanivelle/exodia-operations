import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '@iconify/react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const VIEWED_IDS_KEY = 'prt_viewed_ids'

const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }

function formatDateTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  let h = d.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`
}

function Toast({ trackingId, onClose, onGoToList }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 bg-[#1B1A1C] rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:clipboard-check" className="w-7 h-7 text-[#FF5900]" />
        </div>
        <h3 className="text-[#1B1A1C] text-lg font-bold mb-2">Proceeding to Feasibility Check</h3>
        <p className="text-[#3E4048] text-sm leading-relaxed">
          Tracking ticket <span className="font-semibold text-[#1B1A1C]">{trackingId}</span> is now in the potential list and proceeding for feasibility check.
        </p>
        <div className="flex gap-3 mt-6 justify-center">
          <button
            onClick={onClose}
            className="bg-[#1B1A1C] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Got it
          </button>
          <button
            onClick={onGoToList}
            className="bg-[#FF5900] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Go to Project List
          </button>
        </div>
      </div>
    </div>
  )
}

function EmailComposeModal({ ticket, onSend, onClose, userEmail }) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const [to, setTo] = useState(ticket.email_to || '')
  const [subject, setSubject] = useState('Proceeding to Feasibility check')
  const [body, setBody] = useState(
    `<table width="100%" cellpadding="0" cellspacing="0" style="background:#1B1A1C;padding:40px 20px;font-family:Arial,Helvetica,sans-serif">
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
          <td style="padding:32px">
            <h2 style="color:#1B1A1C;font-size:20px;margin:0 0 8px">Feasibility Check In Progress</h2>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 20px">Good Day Marketing,</p>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 12px">Thank you for forwarding <strong style="color:#FF5900">"${ticket.project_name}"</strong>, tracking ID <strong style="color:#1B1A1C">${ticket.tracking_id}</strong> to review.</p>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 20px">Operations will proceed to our 2 days feasibility check starting today, <strong>${today}</strong>.</p>
            <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin:0 0 20px">
              <p style="color:#1B1A1C;font-size:13px;font-weight:600;margin:0 0 4px">Next Step</p>
              <p style="color:#3E4048;font-size:13px;line-height:1.5;margin:0">Set meeting with the client and us for our discovery call with operations.</p>
            </div>
            <p style="color:#3E4048;font-size:14px;line-height:1.6;margin:0 0 4px">Best regards,</p>
            <p style="color:#FF5900;font-size:14px;font-weight:600;margin:0">Exodia Operations Team</p>
          </td>
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
  )
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

const handleSend = () => {
    setSending(true)
    setSendError('')
    const client = google.accounts.oauth2.initTokenClient({
      client_id: '771932544725-5trevl51v4i49g8j0a0vnqkh7hnikd12.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/gmail.send',
      callback: async (response) => {
        if (response.error) {
          setSendError('Access denied — please allow Gmail access')
          setSending(false)
          return
        }
        setSending(true)
        try {
          const email = [
            `From: ${userEmail || response.email}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            body,
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
            setSendError(err.error?.message || 'Failed to send email')
            setSending(false)
            return
          }
          onSend()
        } catch {
          setSendError('Could not send email')
          setSending(false)
        }
      },
    })
    client.requestAccessToken()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1B1A1C] text-lg font-bold">Compose Email to Marketing</h3>
          <button onClick={onClose} className="text-[#3E4048] hover:text-[#1B1A1C] cursor-pointer">
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">To</label>
            <input
              type="email"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="marketing@example.com"
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
            <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Email Preview</label>
            <div className="border border-[#CACDD7] rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
              <div className="bg-white p-4" dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          </div>
        </div>

        {sendError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {sendError}
          </div>
        )}

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className="text-[#3E4048] text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !to}
            className="bg-[#1B1A1C] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send email to Marketing'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProjectReviewTicket({ onGoToProjectList, userEmail }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [viewedIds, setViewedIds] = useState(() => JSON.parse(localStorage.getItem(VIEWED_IDS_KEY) || '[]'))
  const [toastTracking, setToastTracking] = useState(null)
  const [creating, setCreating] = useState(false)
  const [showEmailCompose, setShowEmailCompose] = useState(false)

  const markViewed = (id) => {
    if (viewedIds.includes(id)) return
    const updated = [...viewedIds, id]
    setViewedIds(updated)
    localStorage.setItem(VIEWED_IDS_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('prt-viewed'))
  }

  const handleProceed = async () => {
    if (!selectedTicket || creating) return
    setCreating(true)
    try {
      const { error: insertError } = await supabase.from('projects').insert({
        project_name: selectedTicket.project_name,
        client_name: selectedTicket.client_name,
        tracking_id: selectedTicket.tracking_id,
        status: 'leads',
        phase: 'initiation',
        pillar: '',
        sent_at: selectedTicket.sent_at,
      })
      if (insertError) throw insertError
      const { error: updateError } = await supabase.from('project_review_tickets').update({ status: 'proceeded' }).eq('id', selectedTicket.id)
      if (updateError) throw updateError
      window.dispatchEvent(new CustomEvent('prt-projects-updated'))
      setToastTracking(selectedTicket.tracking_id || selectedTicket.id)
      setSelectedTicket(null)
    } catch (err) {
      console.error('Proceed failed:', err)
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    const fetchTickets = async (isInitial) => {
      try {
        let url = `${SUPABASE_URL}/rest/v1/project_review_tickets?select=*&order=sent_at.desc`
        const params = new URLSearchParams(window.location.search)
        const trackingId = params.get('tracking_id')
        if (isInitial && trackingId) {
          url = `${SUPABASE_URL}/rest/v1/project_review_tickets?tracking_id=eq.${encodeURIComponent(trackingId)}&select=*`
        }
        const res = await fetch(url, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        const data = await res.json()
        setTickets(data || [])
        setFetchError(null)
        if (isInitial && trackingId && data && data.length > 0) {
          markViewed(data[0].id)
          setSelectedTicket(data[0])
        }
      } catch (err) {
        console.error('Failed to fetch project review tickets:', err)
        setFetchError(err.message || 'Unknown error')
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    fetchTickets(true)

    const interval = setInterval(() => fetchTickets(false), 10000)
    return () => clearInterval(interval)
  }, [])

  const visibleTickets = tickets.filter(t => t.status === 'Sent')

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Project Review Ticket</h2>
        <div className="text-[#3E4048]">Loading tickets...</div>
      </div>
    )
  }

  if (selectedTicket) {
    return (
      <>
        <div className="flex flex-col gap-6">
          <div className="bg-white p-8 rounded-xl shadow-sm">
          <button
            onClick={() => setSelectedTicket(null)}
            className="flex items-center gap-2 text-[#3E4048] hover:text-[#1B1A1C] mb-6 transition-colors cursor-pointer"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Tickets</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="text-[#1B1A1C] text-xl font-semibold mb-1">
                {selectedTicket.project_name || 'Untitled Project'}
                {!viewedIds.includes(selectedTicket.id) && <span className="inline-block w-2 h-2 bg-[#FF5900] rounded-full ml-2 align-middle" />}
              </h2>
              <p className="text-[#3E4048] text-sm">Client: {selectedTicket.client_name || 'N/A'}</p>
            </div>
            <div className="text-right">
              <span className="bg-[#1B1A1C] text-white text-xs px-3 py-1 rounded-full font-medium">Tracking ID: {selectedTicket.tracking_id || '-'}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-[#1B1A1C] text-base font-semibold mb-3">Email Details</h3>
            <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-5 space-y-3">
              <div>
                <p className="text-xs text-[#3E4048] font-medium uppercase tracking-wider">To</p>
                <p className="text-sm text-[#1B1A1C]">{selectedTicket.email_to || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#3E4048] font-medium uppercase tracking-wider">Subject</p>
                <p className="text-sm text-[#1B1A1C]">{selectedTicket.email_subject || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#3E4048] font-medium uppercase tracking-wider">Body</p>
                <p className="text-sm text-[#3E4048] whitespace-pre-wrap leading-relaxed">{selectedTicket.email_body || 'No content.'}</p>
              </div>
              {selectedTicket.attachment_pdf && (
                <div>
                  <p className="text-xs text-[#3E4048] font-medium uppercase tracking-wider">Attachment (PDF)</p>
                  <p className="text-sm text-[#FF5900]">{selectedTicket.attachment_pdf}</p>
                </div>
              )}
              {selectedTicket.additional_attachments && selectedTicket.additional_attachments.filter(a => typeof a === 'string').length > 0 && (
                <div>
                  <p className="text-xs text-[#3E4048] font-medium uppercase tracking-wider">Additional Attachments</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTicket.additional_attachments.filter(a => typeof a === 'string').map((url, i) => (
                      <span key={i} className="text-xs text-[#FF5900] bg-orange-50 px-2 py-1 rounded">{url}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

<button
            onClick={() => setShowEmailCompose(true)}
            className="bg-[#1B1A1C] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Proceed to Feasibility check
          </button>
</div>
      </div>

      {showEmailCompose && selectedTicket && (
        <EmailComposeModal
          ticket={selectedTicket}
          onSend={handleProceed}
          onClose={() => setShowEmailCompose(false)}
          userEmail={userEmail}
        />
      )}
    </>
  )
  }

  return (
    <div className="flex flex-col gap-6">
      {toastTracking && (
        <Toast trackingId={toastTracking} onClose={() => setToastTracking(null)} onGoToList={onGoToProjectList} />
      )}
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#1B1A1C] text-xl font-semibold mb-1">Project Review Ticket</h2>
            <p className="text-[#3E4048] text-sm">Review tickets from client project reviews</p>
          </div>
          <span className="text-sm text-[#3E4048] bg-[#CACDD7]/30 px-3 py-1 rounded-full">
            {visibleTickets.length} tickets
          </span>
        </div>

        {fetchError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
              Error loading tickets: {fetchError}
            </div>
          )}

        {visibleTickets.length === 0 ? (
          <div className="text-center py-16">
            <Icon icon="lucide:inbox" className="w-12 h-12 text-[#CACDD7] mx-auto mb-4" />
            <p className="text-[#3E4048] text-sm">No review tickets found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => { markViewed(ticket.id); setSelectedTicket(ticket) }}
                className={`rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3 ${
                  !viewedIds.includes(ticket.id)
                    ? 'bg-[#1B1A1C] border border-[#3E4048]'
                    : 'bg-white border border-[#CACDD7]/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {!viewedIds.includes(ticket.id) && <span className="w-2.5 h-2.5 bg-[#FF5900] rounded-full flex-shrink-0 mt-0.5" />}
                    <h3 className={`text-sm font-semibold truncate ${!viewedIds.includes(ticket.id) ? 'text-white' : 'text-[#1B1A1C]'}`}>{ticket.project_name || 'Untitled'}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
  !viewedIds.includes(ticket.id) ? 'bg-white/20 text-white' : 'bg-[#1B1A1C] text-white'
}`}>{ticket.tracking_id || ''}</span>
                </div>

                <div className={`flex flex-col gap-1 text-xs ${!viewedIds.includes(ticket.id) ? 'text-[#CACDD7]' : 'text-[#3E4048]'}`}>
                  <p><span className={`font-medium ${!viewedIds.includes(ticket.id) ? 'text-white' : 'text-[#1B1A1C]'}`}>Client:</span> {ticket.client_name || '-'}</p>
                  <p><span className={`font-medium ${!viewedIds.includes(ticket.id) ? 'text-white' : 'text-[#1B1A1C]'}`}>Date:</span> {formatDateTime(ticket.sent_at)}</p>
                </div>

                <div className="pt-1">
                  <span className="text-[#FF5900] text-xs font-semibold">View Details &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectReviewTicket