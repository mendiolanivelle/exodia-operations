import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const VIEWED_IDS_KEY = 'prt_viewed_ids'
const PROCEEDED_IDS_KEY = 'prt_proceeded_ids'

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

function EmailComposeModal({ ticket, onSend, onClose }) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const [to, setTo] = useState(ticket.email_to || '')
  const [subject, setSubject] = useState('Proceeding to Feasibility check')
  const [body, setBody] = useState(
    `Good Day Marketing, thank you for forwarding "${ticket.project_name}", "${ticket.tracking_id}" to review. Operation will proceed to our 2 days feasibility check. Starting today, ${today}.

Set meeting with the client and me for our discovery call with ops.

Thank you`
  )
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const handleSend = async () => {
    setSending(true)
    setSendError('')
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(gmailUrl, '_blank')
    onSend()
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
            <label className="text-[#1B1A1C] text-sm font-medium mb-1 block">Body</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={10}
              className="w-full px-4 py-2.5 border border-[#CACDD7] rounded-lg text-sm focus:outline-none focus:border-[#FF5900] resize-none"
            />
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

function ProjectReviewTicket({ onGoToProjectList }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [viewedIds, setViewedIds] = useState(() => JSON.parse(localStorage.getItem(VIEWED_IDS_KEY) || '[]'))
  const [proceededIds, setProceededIds] = useState(() => JSON.parse(localStorage.getItem(PROCEEDED_IDS_KEY) || '[]'))
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
      await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project_name: selectedTicket.project_name,
          client_name: selectedTicket.client_name,
          tracking_id: selectedTicket.tracking_id,
          status: 'potential',
        }),
      })
      await fetch(`${SUPABASE_URL}/rest/v1/project_review_tickets?id=eq.${selectedTicket.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'potential' }),
      })
      const potentialKey = 'prt_potential_projects'
      const existing = JSON.parse(localStorage.getItem(potentialKey) || '[]')
      const newEntry = {
        id: selectedTicket.id,
        project_name: selectedTicket.project_name,
        client_name: selectedTicket.client_name,
        tracking_id: selectedTicket.tracking_id,
        sent_at: selectedTicket.sent_at,
        status: 'potential',
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(potentialKey, JSON.stringify([newEntry, ...existing]))
      const id = selectedTicket.id
      const updated = [...proceededIds, id]
      setProceededIds(updated)
      localStorage.setItem(PROCEEDED_IDS_KEY, JSON.stringify(updated))
      setToastTracking(selectedTicket.tracking_id || selectedTicket.id)
      setSelectedTicket(null)
    } catch {} finally {
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

  const visibleTickets = tickets.filter(t => !proceededIds.includes(t.id))

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
              {selectedTicket.additional_attachments && selectedTicket.additional_attachments.length > 0 && (
                <div>
                  <p className="text-xs text-[#3E4048] font-medium uppercase tracking-wider">Additional Attachments</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTicket.additional_attachments.map((url, i) => (
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