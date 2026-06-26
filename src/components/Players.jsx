import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Players() {
  const [employees, setEmployees] = useState([])
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase.from('employees').select('*')
        if (error) throw error
        if (data && data.length > 0) {
          setColumns(Object.keys(data[0]))
          setEmployees(data)
        }
        setLoading(false)
      } catch (err) {
        setError(err.message)
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

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Players</h2>
        <div className="bg-red-50 text-red-600 p-4 rounded-md border-l-4 border-red-600 text-sm">
          {error}
        </div>
        <p className="text-[#3E4048] text-sm mt-4">
          Unable to load employee data. Make sure you have access to the employees table.
        </p>
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Players</h2>
        <p className="text-[#3E4048]">No employee records found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#1B1A1C] text-xl font-semibold">Players</h2>
        <span className="text-sm text-[#3E4048] bg-[#CACDD7]/30 px-3 py-1 rounded-full">
          {employees.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#CACDD7]">
              {columns.map((col) => (
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
              <tr key={emp.id || emp.employee_id} className="border-b border-[#CACDD7]/50 hover:bg-gray-50">
                {columns.map((col) => (
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