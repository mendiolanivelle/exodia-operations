import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '@iconify/react'

function ProjectReviewTicket() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('project_review_tickets')
          .select('*')
          .order('sent_at', { ascending: false })
        if (error) throw error
        setTickets(data || [])
      } catch {
        setTickets([])
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
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
              <h2 className="text-[#1B1A1C] text-xl font-semibold mb-1">{selectedTicket.project_name || 'Untitled Project'}</h2>
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

        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <Icon icon="lucide:inbox" className="w-12 h-12 text-[#CACDD7] mx-auto mb-4" />
            <p className="text-[#3E4048] text-sm">No review tickets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#CACDD7]">
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap">Project</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap hidden md:table-cell">Client</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-[#CACDD7]/50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap">{ticket.project_name || 'Untitled'}</td>
                    <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden md:table-cell">{ticket.client_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        ticket.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : ticket.status === 'in_review'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {ticket.status ? ticket.status.replace('_', ' ') : 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{ticket.sent_at ? new Date(ticket.sent_at).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-[#FF5900] text-xs font-semibold hover:underline cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectReviewTicket