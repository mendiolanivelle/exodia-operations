import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const playersColumns = ['employee_id', 'full_name', 'work_email', 'department_text', 'position_title', 'employment_type', 'employment_status', 'date_hired_text']

function Players() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase.from('employee_master').select('*')
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
      <div className="flex items-center justify-center bg-white p-12 rounded-xl shadow-sm">
        <div className="text-[#3E4048] text-base">Loading employee data...</div>
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Player List</h2>
        <p className="text-[#3E4048]">No employee records found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#1B1A1C] text-xl font-semibold">Player List</h2>
        <span className="text-sm text-[#3E4048] bg-[#CACDD7]/30 px-3 py-1 rounded-full">
          {employees.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#CACDD7]">
              {playersColumns.map((col) => (
                <th
                  key={col}
                  className="text-left px-4 py-3 text-[#3E4048] font-medium capitalize whitespace-nowrap"
                >
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.employee_id || emp.id} className="border-b border-[#CACDD7]/50 hover:bg-gray-50">
                {playersColumns.map((col) => (
                  <td key={col} className="px-4 py-3 text-[#1B1A1C] whitespace-nowrap">
                    {emp[col] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Players