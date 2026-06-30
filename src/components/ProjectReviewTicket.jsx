import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const VIEWED_IDS_KEY = 'prt_viewed_ids'

function ProjectReviewTicket() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [viewedIds, setViewedIds] = useState(() => JSON.parse(localStorage.getItem(VIEWED_IDS_KEY) || '[]'))

  const markViewed = (id) => {
    if (viewedIds.includes(id)) return
    const updated = [...viewedIds, id]
    setViewedIds(updated)
    localStorage.setItem(VIEWED_IDS_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('prt-viewed'))
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
          window.history.replaceState({}, '', window.location.pathname)
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
              <p className="text-[#3E4048] text-xs">Tracking ID: {selectedTicket.tracking_id || '-'}</p>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
              selectedTicket.status === 'approved'
                ? 'bg-green-100 text-green-700'
                : selectedTicket.status === 'in_review'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {selectedTicket.status ? selectedTicket.status.replace('_', ' ') : 'pending'}
            </span>
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
            className="bg-[#1B1A1C] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Proceed to Feasibility check
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#1B1A1C] text-xl font-semibold mb-1">Project Review Ticket</h2>
            <p className="text-[#3E4048] text-sm">Review tickets from client project reviews</p>
          </div>
          <span className="text-sm text-[#3E4048] bg-[#CACDD7]/30 px-3 py-1 rounded-full">
            {tickets.length} tickets
          </span>
        </div>

        {fetchError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
              Error loading tickets: {fetchError}
            </div>
          )}

        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <Icon icon="lucide:inbox" className="w-12 h-12 text-[#CACDD7] mx-auto mb-4" />
            <p className="text-[#3E4048] text-sm">No review tickets found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tickets.map((ticket) => (
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
                  <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                    ticket.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : ticket.status === 'in_review'
                      ? 'bg-yellow-100 text-yellow-700'
                      : ticket.status === 'Sent'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.status ? ticket.status.replace('_', ' ') : 'pending'}
                  </span>
                </div>

                <div className={`flex flex-col gap-1 text-xs ${!viewedIds.includes(ticket.id) ? 'text-[#CACDD7]' : 'text-[#3E4048]'}`}>
                  <p><span className={`font-medium ${!viewedIds.includes(ticket.id) ? 'text-white' : 'text-[#1B1A1C]'}`}>Client:</span> {ticket.client_name || '-'}</p>
                  <p><span className={`font-medium ${!viewedIds.includes(ticket.id) ? 'text-white' : 'text-[#1B1A1C]'}`}>Tracking:</span> {ticket.tracking_id || '-'}</p>
                  <p><span className={`font-medium ${!viewedIds.includes(ticket.id) ? 'text-white' : 'text-[#1B1A1C]'}`}>Date:</span> {ticket.sent_at ? new Date(ticket.sent_at).toLocaleDateString() : '-'}</p>
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