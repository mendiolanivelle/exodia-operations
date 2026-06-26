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
          .from('project_reviews')
          .select('*')
          .order('created_at', { ascending: false })
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

          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[#1B1A1C] text-xl font-semibold mb-1">{selectedTicket.project_name || 'Untitled Project'}</h2>
              <p className="text-[#3E4048] text-sm">Client: {selectedTicket.client_name || 'N/A'}</p>
            </div>
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

          <div className="mb-8">
            <h3 className="text-[#1B1A1C] text-base font-semibold mb-3">Acceptance Criteria</h3>
            <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-5">
              {selectedTicket.acceptance_criteria ? (
                <p className="text-[#3E4048] text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.acceptance_criteria}
                </p>
              ) : (
                <p className="text-[#3E4048] text-sm italic">No acceptance criteria provided.</p>
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
                    <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '-'}</td>
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