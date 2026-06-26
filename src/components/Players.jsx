import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const hrEmployees = [
  {"employee_id":"2025001","full_name":"Mendiola, Nivelle D.","email":"nivelle@exodiagamedev.com","department":"Board of Director","position_title":"Chief Executive Officer","classification":"Regular Employee","status":"Active","date_hired":"February 14, 2017","start_date":"February 14, 2017","immediate_supervisor":"Board of Director"},
  {"employee_id":"2025002","full_name":"Bahan, Neil Allen O.","email":"neil@exodiagamedev.com","department":"Operation","position_title":"Chief Operating Officer","classification":"Regular Employee","status":"Active","date_hired":"February 15, 2017","start_date":"February 15, 2017","immediate_supervisor":"Board of Director"},
  {"employee_id":"2025003","full_name":"Borongan, Jeff Dominique D.","email":"jeff@exodiagamedev.com","department":"IT","position_title":"Chief Infrastructure Officer","classification":"Regular Employee","status":"Active","date_hired":"February 16, 2017","start_date":"February 16, 2017","immediate_supervisor":"Board of Director"},
  {"employee_id":"2025004","full_name":"Holganza, Keisha Mae I.","email":"keisha@exodiagamedev.com","department":"Human Resources","position_title":"HR Director OIC","classification":"Regular Employee","status":"Active","date_hired":"July 18, 2024","start_date":"July 18, 2024","immediate_supervisor":"Nivelle Mendiola"},
  {"employee_id":"2025005","full_name":"Oncines, Jethel Grace","email":"jethel@exodiagamedev.com","department":"Finance","position_title":"Finance Director OIC","classification":"Regular Employee","status":"Active","date_hired":"August 27, 2024","start_date":"August 27, 2024","immediate_supervisor":"Jeff Dominique Borongan"},
  {"employee_id":"2025006","full_name":"Tahadlangit, Jay G.","email":"jay@exodiagamedev.com","department":"Human Resources","position_title":"Recruitment OIC","classification":"Regular Employee","status":"Resigned","date_hired":"August 27, 2024","start_date":"August 27, 2024","immediate_supervisor":"Keisha Mae Holganza"},
  {"employee_id":"2025008","full_name":"Pañares, Bernard Jr. R.","email":"bernard@exodiagamedev.com","department":"Operation","position_title":"Staff Augmentation Management OIC","classification":"Regular Employee","status":"Floating","date_hired":"January 19, 2024","start_date":"January 19, 2024","immediate_supervisor":"Neil Allen Bahan"},
  {"employee_id":"2025009","full_name":"Toring, Angel Love C.","email":"angel@exodiagamedev.com","department":"Operation","position_title":"Project Management OIC","classification":"Regular Employee","status":"Active","date_hired":"January 15, 2024","start_date":"January 15, 2024","immediate_supervisor":"Neil Allen Bahan"},
  {"employee_id":"2025010","full_name":"Ecija, Aldous Clark C.","email":"aldous@exodiagamedev.com","department":"Operation","position_title":"Sound Artist","classification":"Regular Employee","status":"Floating","date_hired":"September 01, 2022","start_date":"September 01, 2022","immediate_supervisor":"Neil Allen Bahan"},
  {"employee_id":"2025011","full_name":"Bade, Jorjanseen Earl D.","email":"jorjanseen@exodiagamedev.com","department":"Operation","position_title":"Programmer","classification":"Regular Employee","status":"Floating","date_hired":"January 22, 2024","start_date":"January 22, 2024","immediate_supervisor":"Neil Allen Bahan"},
  {"employee_id":"2025016","full_name":"Pableo, Maxene Alexis C.","email":"maxene_pableo@exodiagamedev.com","department":"Marketing","position_title":"Marketing Coordinator","classification":"Probationary Employee","status":"Active","date_hired":"January 5, 2026","start_date":"January 5, 2026","immediate_supervisor":"Nivelle Mendiola"},
  {"employee_id":"2025030","full_name":"Enerio, Julia Gayle M.","email":"juliagayle_enerio@exodiagamedev.com","department":"Office of the President","position_title":"Executive Assistant","classification":"Probationary Employee","status":"Active","date_hired":"March 30, 2026","start_date":"March 30, 2026","immediate_supervisor":"Nivelle Mendiola"}
]

const playersColumns = ['employee_id', 'full_name', 'email', 'department', 'position_title', 'classification', 'status', 'date_hired']

function Players() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase.from('exodia_profiles').select('*')
        if (error) throw error
        if (data && data.length > 0) {
          setEmployees(data)
        } else {
          setEmployees(hrEmployees)
        }
      } catch {
        setEmployees(hrEmployees)
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

  if (error && employees.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Players</h2>
        <div className="bg-red-50 text-red-600 p-4 rounded-md border-l-4 border-red-600 text-sm">
          {error}
        </div>
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