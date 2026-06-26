import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function RoleInventory() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingRes, employeesRes] = await Promise.all([
          supabase.from('manpower_pricing').select('role, level, category'),
          supabase.from('employee_master').select('position_title').eq('department_text', 'Operation'),
        ])

        if (pricingRes.error) throw pricingRes.error
        if (employeesRes.error) throw employeesRes.error

        const pricingRoles = pricingRes.data || []
        const employeeTitles = (employeesRes.data || []).map(e => e.position_title || '')

        const roleMap = {}
        pricingRoles.forEach(r => {
          const key = r.role
          if (!roleMap[key]) {
            roleMap[key] = { role: key, category: r.category, count: 0, levels: new Set() }
          }
          roleMap[key].levels.add(r.level)
        })

        employeeTitles.forEach(title => {
          const titleLower = title.toLowerCase()
          Object.keys(roleMap).forEach(roleKey => {
            const roleLower = roleKey.toLowerCase()
            if (titleLower.includes(roleLower) || roleLower.includes(titleLower)) {
              roleMap[roleKey].count += 1
            }
          })
        })

        const result = Object.values(roleMap).map(r => ({
          ...r,
          levels: Array.from(r.levels).join(', '),
        })).sort((a, b) => b.count - a.count || a.role.localeCompare(b.role))

        setRoles(result)
      } catch {
        setRoles([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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

  const filled = roles.filter(r => r.count > 0)
  const vacant = roles.filter(r => r.count === 0)

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#1B1A1C] text-xl font-semibold">Role Inventory</h2>
        <div className="flex gap-2 text-sm">
          <span className="text-green-700 bg-green-50 px-3 py-1 rounded-full">{filled.length} filled</span>
          <span className="text-[#3E4048] bg-[#CACDD7]/30 px-3 py-1 rounded-full">{vacant.length} vacant</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#CACDD7]">
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Role</th>
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Category</th>
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium">Levels</th>
              <th className="text-center px-4 py-3 text-[#3E4048] font-medium">Headcount</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r, i) => (
              <tr key={i} className={`border-b border-[#CACDD7]/50 hover:bg-gray-50 ${r.count > 0 ? '' : 'opacity-50'}`}>
                <td className="px-4 py-3 text-[#1B1A1C] font-medium">{r.role}</td>
                <td className="px-4 py-3 text-[#3E4048]">{r.category}</td>
                <td className="px-4 py-3 text-[#3E4048] text-xs">{r.levels}</td>
                <td className="px-4 py-3 text-center">
                  {r.count > 0 ? (
                    <span className="bg-[#FF5900] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {r.count}
                    </span>
                  ) : (
                    <span className="text-[#CACDD7] text-xs">—</span>
                  )}
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