import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Players() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_master')
          .select('*')
          .eq('department_text', 'Operation')
        if (error) throw error
        setEmployees(data || [])
      } catch {
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm">
        <div className="text-[#3E4048] text-base">Loading employee data...</div>
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Player List</h2>
        <p className="text-[#3E4048]">No employee records found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <h2 className="text-[#1B1A1C] text-xl font-semibold">Player List</h2>
        <span className="text-sm text-[#3E4048] bg-[#CACDD7]/30 px-3 py-1 rounded-full self-start sm:self-auto">
          {employees.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#CACDD7]">
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap">ID</th>
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap">Name</th>
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap hidden lg:table-cell">Department</th>
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap">Position</th>
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap hidden lg:table-cell">Type</th>
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap">Status</th>
              <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap hidden xl:table-cell">Date Hired</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.employee_id || emp.id} className="border-b border-[#CACDD7]/50 hover:bg-gray-50">
                <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap text-xs font-mono">{emp.employee_id || '-'}</td>
                <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap truncate max-w-[180px]">{emp.full_name || '-'}</td>
                <td className="px-4 py-3 text-[#3E4048] truncate max-w-[200px] hidden md:table-cell">{emp.work_email || '-'}</td>
                <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{emp.department_text || '-'}</td>
                <td className="px-4 py-3 text-[#1B1A1C] whitespace-nowrap truncate max-w-[160px]">{emp.position_title || '-'}</td>
                <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">{emp.employment_type || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                    emp.employment_status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : emp.employment_status === 'Floating'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {emp.employment_status || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden xl:table-cell">{emp.date_hired_text || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Players