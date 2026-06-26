import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function RoleInventory() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_master')
          .select('position_title')
          .eq('department_text', 'Operation')

        if (error) throw error

        const counts = {}
        ;(data || []).forEach(emp => {
          const title = emp.position_title || 'Unknown'
          counts[title] = (counts[title] || 0) + 1
        })

        const sorted = Object.entries(counts)
          .map(([role, count]) => ({ role, count }))
          .sort((a, b) => b.count - a.count)

        setRoles(sorted)
      } catch {
        setRoles([])
      } finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [])

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Role Inventory</h2>
        <div className="text-[#3E4048]">Loading role data...</div>
      </div>
    )
  }

  if (roles.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Role Inventory</h2>
        <p className="text-[#3E4048]">No role data found.</p>
      </div>
    )
  }

  const total = roles.reduce((sum, r) => sum + r.count, 0)

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#1B1A1C] text-xl font-semibold">Role Inventory</h2>
          <p className="text-[#3E4048] text-sm mt-1">Operation department headcount by position</p>
        </div>
        <span className="text-sm text-[#3E4048] bg-[#CACDD7]/30 px-3 py-1 rounded-full">
          {total} total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#CACDD7]">
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Position Title</th>
              <th className="text-right px-4 py-3 text-[#3E4048] font-medium">Headcount</th>
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r, i) => (
              <tr key={i} className="border-b border-[#CACDD7]/50 hover:bg-gray-50">
                <td className="px-4 py-3 text-[#1B1A1C] font-medium">{r.role}</td>
                <td className="px-4 py-3 text-right">
                  <span className="bg-[#FF5900] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {r.count}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#3E4048]">
                  {((r.count / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RoleInventory