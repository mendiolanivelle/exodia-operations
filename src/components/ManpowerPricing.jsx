import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import manpowerPricing from '../data/manpowerPricing'

const categories = ['Generalist', 'Specialist', 'Engineering', 'Audio', 'Cinematics', 'Production']

function ManpowerPricing() {
  const [activeCategory, setActiveCategory] = useState('Generalist')
  const [data, setData] = useState(manpowerPricing)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    const syncToSupabase = async () => {
      try {
        const { count, error } = await supabase
          .from('manpower_pricing')
          .select('*', { count: 'exact', head: true })

        if (error && error.code === '42P01') {
          const { error: insertError } = await supabase
            .from('manpower_pricing')
            .insert(manpowerPricing.map(r => ({
              category: r.category,
              sub_category: r.sub_category,
              role: r.role,
              level: r.level,
              price_per_day: r.price_per_day || null,
              description: r.description
            })))

          if (!insertError) {
            setSynced(true)
            const { data: fetched } = await supabase.from('manpower_pricing').select('*')
            if (fetched) setData(fetched)
          }
        } else if (!error && count !== null) {
          setSynced(true)
          const { data: fetched } = await supabase.from('manpower_pricing').select('*')
          if (fetched) setData(fetched)
        }
      } catch {
        // Keep embedded data
      }
    }
    syncToSupabase()
  }, [])

  const filtered = data.filter(r => r.category === activeCategory)

  const levelOrder = { 'Director': 0, 'Senior': 1, 'Mid': 2, 'Junior': 3 }
  const grouped = {}
  filtered.forEach(r => {
    const key = r.role
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(r)
  })

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#1B1A1C] text-xl font-semibold">Manpower & Pricing</h2>
        {synced && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Synced to Supabase</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-[#FF5900] text-white'
                : 'bg-gray-100 text-[#3E4048] hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([subCat, rows]) => (
          <div key={subCat}>
            <h3 className="text-[#1B1A1C] text-base font-semibold mb-3">{subCat}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#CACDD7]">
                    <th className="text-left px-4 py-2 text-[#3E4048] font-medium w-24">Level</th>
                    <th className="text-left px-4 py-2 text-[#3E4048] font-medium w-20">$/Day</th>
                    <th className="text-left px-4 py-2 text-[#3E4048] font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {rows
                    .sort((a, b) => (levelOrder[a.level] ?? 99) - (levelOrder[b.level] ?? 99))
                    .map((r, i) => (
                      <tr key={i} className="border-b border-[#CACDD7]/50 hover:bg-gray-50">
                        <td className="px-4 py-2 text-[#1B1A1C] font-medium whitespace-nowrap">{r.level}</td>
                        <td className="px-4 py-2 text-[#FF5900] font-semibold whitespace-nowrap">
                          {r.price_per_day && !['n/a', ''].includes(r.price_per_day)
                            ? `$${r.price_per_day}`
                            : '-'}
                        </td>
                        <td className="px-4 py-2 text-[#3E4048] text-xs leading-relaxed">{r.description}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ManpowerPricing