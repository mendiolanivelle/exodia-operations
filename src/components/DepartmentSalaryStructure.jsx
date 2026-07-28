import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '@iconify/react'

function DepartmentSalaryStructure() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedDept, setExpandedDept] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: empData } = await supabase
          .from('employee_master')
          .select('employee_id, full_name, department_text, position_title, employment_type, employment_status')
          .order('department_text', { ascending: true })
        const { data: pricing } = await supabase
          .from('manpower_pricing')
          .select('role, level, price_per_day, category')
          .order('role', { ascending: true })
        setEmployees(empData || [])
        if (pricing) {
          const rates = {}
          pricing.forEach(p => {
            const key = `${p.role}|${p.level}`
            if (p.price_per_day) rates[key] = p.price_per_day
          })
          const enriched = (empData || []).map(emp => {
            const key = `${emp.position_title}|`
            return { ...emp, price_per_day: rates[key] || '-' }
          })
          setEmployees(enriched)
        }
      } catch {
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const departments = {}
  employees.forEach(emp => {
    const dept = emp.department_text || 'Unassigned'
    if (!departments[dept]) departments[dept] = []
    departments[dept].push(emp)
  })

  const sortedDepts = Object.keys(departments).sort()

  const statusColors = {
    'Active': 'bg-green-100 text-green-700',
    'Floating': 'bg-yellow-100 text-yellow-700',
    'Resigned': 'bg-red-100 text-red-700',
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <div className="text-[#3E4048] text-base">Loading salary data...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#1B1A1C] text-xl font-semibold">Department Salary Structure</h2>
          <span className="text-sm text-[#3E4048] bg-[#CACDD7]/30 px-3 py-1 rounded-full">
            {employees.length} employees
          </span>
        </div>

        <div className="space-y-3">
          {sortedDepts.map(dept => {
            const members = departments[dept]
            const active = members.filter(m => m.employment_status === 'Active').length
            const floating = members.filter(m => m.employment_status === 'Floating').length
            const resigned = members.filter(m => m.employment_status === 'Resigned').length
            const isExpanded = expandedDept === dept
            return (
              <div key={dept} className="border border-[#CACDD7]/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedDept(isExpanded ? null : dept)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-[#F9FAFB] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon icon={isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'} className="w-4 h-4 text-[#3E4048]" />
                    <span className="text-sm font-semibold text-[#1B1A1C]">{dept}</span>
                    <span className="text-xs text-[#3E4048]">({members.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {active > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{active} Active</span>}
                    {floating > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">{floating} Floating</span>}
                    {resigned > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{resigned} Resigned</span>}
                  </div>
                </button>
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#CACDD7]/30 bg-white">
                          <th className="text-left px-5 py-3 text-[#3E4048] font-medium">ID</th>
                          <th className="text-left px-5 py-3 text-[#3E4048] font-medium">Name</th>
                          <th className="text-left px-5 py-3 text-[#3E4048] font-medium">Position</th>
                          <th className="text-left px-5 py-3 text-[#3E4048] font-medium">Type</th>
                          <th className="text-left px-5 py-3 text-[#3E4048] font-medium">Status</th>
                          <th className="text-left px-5 py-3 text-[#3E4048] font-medium">Rate/Day</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map(emp => (
                          <tr key={emp.employee_id} className="border-b border-[#CACDD7]/20 hover:bg-gray-50">
                            <td className="px-5 py-3 text-[#3E4048] text-xs font-mono">{emp.employee_id || '-'}</td>
                            <td className="px-5 py-3 text-[#1B1A1C] font-medium">{emp.full_name || '-'}</td>
                            <td className="px-5 py-3 text-[#1B1A1C]">{emp.position_title || '-'}</td>
                            <td className="px-5 py-3 text-[#3E4048]">{emp.employment_type || '-'}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[emp.employment_status] || 'bg-gray-100 text-gray-700'}`}>
                                {emp.employment_status || '-'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-[#1B1A1C] font-mono">
                              {emp.price_per_day !== '-' ? `$${emp.price_per_day}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DepartmentSalaryStructure