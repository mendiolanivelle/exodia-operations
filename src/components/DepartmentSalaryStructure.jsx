import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '@iconify/react'

function DepartmentSalaryStructure() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold">Department Salary Structure</h2>
      </div>
    </div>
  )
}

export default DepartmentSalaryStructure