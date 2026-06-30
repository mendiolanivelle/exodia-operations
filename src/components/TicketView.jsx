import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

function TicketView() {
  const { trackingId } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const url = `${SUPABASE_URL}/rest/v1/project_review_tickets?tracking_id=eq.${encodeURIComponent(trackingId)}&select=*`
        const res = await fetch(url, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setTicket(data?.[0] || null)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTicket()
  }, [trackingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#CACDD7]/20 flex items-center justify-center">
        <div className="text-[#3E4048]">Loading ticket...</div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#CACDD7]/20 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <p className="text-[#3E4048] mb-4">Ticket not found.</p>
          <button onClick={() => navigate('/')} className="text-[#FF5900] text-sm font-semibold cursor-pointer">Back to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#CACDD7]/20 p-10">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#3E4048] hover:text-[#1B1A1C] mb-6 transition-colors cursor-pointer">
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h1 className="text-[#1B1A1C] text-xl font-semibold mb-1">{ticket.project_name || 'Untitled Project'}</h1>
              <p className="text-[#3E4048] text-sm">Client: {ticket.client_name || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-[#3E4048] text-xs">Tracking ID: {ticket.tracking_id || '-'}</p>
              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-1 ${
                ticket.status === 'approved' ? 'bg-green-100 text-green-700'
                : ticket.status === 'in_review' ? 'bg-yellow-100 text-yellow-700'
                : 'bg-blue-100 text-blue-700'
              }`}>
                {ticket.status ? ticket.status.replace('_', ' ') : 'pending'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-[#1B1A1C] text-base font-semibold mb-3">Email Details</h3>
            <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-5 space-y-3">
              <div>
                <p className="text-xs text-[#3E4048] font-medium uppercase tracking-wider">To</p>
                <p className="text-sm text-[#1B1A1C]">{ticket.email_to || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#3E4048] font-medium uppercase tracking-wider">Subject</p>
                <p className="text-sm text-[#1B1A1C]">{ticket.email_subject || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#3E4048] font-medium uppercase tracking-wider">Body</p>
                <p className="text-sm text-[#3E4048] whitespace-pre-wrap leading-relaxed">{ticket.email_body || 'No content.'}</p>
              </div>
              {ticket.attachment_pdf && (
                <div>
                  <p className="text-xs text-[#3E4048] font-medium uppercase tracking-wider">Attachment (PDF)</p>
                  <p className="text-sm text-[#FF5900]">{ticket.attachment_pdf}</p>
                </div>
              )}
            </div>
          </div>

          <button className="bg-[#1B1A1C] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
            Proceed to Feasibility check
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketView