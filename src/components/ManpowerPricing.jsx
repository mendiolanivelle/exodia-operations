import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '@iconify/react'

const categories = ['Generalist', 'Specialist', 'Engineering', 'Audio', 'Cinematics', 'Production']
const levels = ['Director', 'Senior', 'Mid', 'Junior']
const levelOrder = { 'Director': 0, 'Senior': 1, 'Mid': 2, 'Junior': 3 }

function ManpowerPricing() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Generalist')
  const [modal, setModal] = useState({ open: false, type: null, form: {}, batchRole: null })

  const fetchData = useCallback(async () => {
    try {
      const { data: result } = await supabase.from('manpower_pricing').select('*')
      setData(result || [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openRoleEdit = (roleName) => {
    setModal({ open: true, type: 'role', form: { role: roleName }, batchRole: roleName })
  }

  const openRoleDelete = async (roleName) => {
    const ids = data.filter(r => r.role === roleName && r.category === activeCategory).map(r => r.id)
    if (!ids.length) return
    if (!window.confirm(`Delete role "${roleName}" and all its levels (${ids.length} records)?`)) return
    try {
      for (const id of ids) {
        const { error } = await supabase.from('manpower_pricing').delete().eq('id', id)
        if (error) { alert('Delete failed: ' + error.message); return }
      }
      await fetchData()
    } catch (err) { alert('Delete failed: ' + err.message) }
  }

  const openLevelEdit = (record) => {
    setModal({
      open: true,
      type: 'level',
      form: {
        id: record.id,
        level: record.level,
        price_per_day: record.price_per_day || '',
        description: record.description || '',
      },
      batchRole: null
    })
  }

  const openLevelAdd = (roleName) => {
    setModal({
      open: true,
      type: 'add-level',
      form: {
        id: null,
        role: roleName,
        category: activeCategory,
        sub_category: roleName,
        level: 'Director',
        price_per_day: '',
        description: '',
      },
      batchRole: null
    })
  }

  const openLevelDelete = async (record) => {
    if (!window.confirm(`Delete "${record.level}" level for "${record.role}"?`)) return
    try {
      const { error } = await supabase.from('manpower_pricing').delete().eq('id', record.id)
      if (error) { alert('Delete failed: ' + error.message); return }
      await fetchData()
    } catch (err) { alert('Delete failed: ' + err.message) }
  }

  const handleSave = async () => {
    const { type, form, batchRole } = modal
    if (type === 'role') {
      if (!form.role) return
      const ids = data.filter(r => r.role === batchRole && r.category === activeCategory).map(r => r.id)
      for (const id of ids) {
        const { error } = await supabase.from('manpower_pricing').update({ role: form.role }).eq('id', id)
        if (error) { alert('Update failed: ' + error.message); return }
      }
    } else if (type === 'level') {
      const payload = {
        level: form.level,
        price_per_day: form.price_per_day || null,
        description: form.description || '',
      }
      const { error } = await supabase.from('manpower_pricing').update(payload).eq('id', form.id)
      if (error) { alert('Update failed: ' + error.message); return }
    } else if (type === 'add-level') {
      const { error } = await supabase.from('manpower_pricing').insert({
        category: form.category,
        sub_category: form.sub_category || form.role,
        role: form.role,
        level: form.level,
        price_per_day: form.price_per_day || null,
        description: form.description || '',
      })
      if (error) { alert('Add failed: ' + error.message); return }
    }
    setModal({ open: false, type: null, form: {}, batchRole: null })
    await fetchData()
  }

  const grouped = {}
  data.filter(r => r.category === activeCategory).forEach(r => {
    if (!grouped[r.role]) grouped[r.role] = []
    grouped[r.role].push(r)
  })

  if (loading) {
    return <div className="bg-white p-8 rounded-xl shadow-sm"><div className="text-[#3E4048]">Loading...</div></div>
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#1B1A1C] text-xl font-semibold">Manpower & Pricing</h2>
        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">{data.length} records</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === cat ? 'bg-[#FF5900] text-white' : 'bg-gray-100 text-[#3E4048] hover:bg-gray-200'
            }`}
          >{cat}</button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).length === 0 && (
          <p className="text-[#3E4048] text-sm">No roles in this category.</p>
        )}
        {Object.entries(grouped).map(([roleName, rows]) => (
          <div key={roleName}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#1B1A1C] text-base font-semibold">{roleName}</h3>
              <div className="flex gap-1">
                <button onClick={() => openLevelAdd(roleName)}
                  className="text-xs text-[#3E4048] hover:text-green-600 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1">
                  <Icon icon="lucide:plus" className="w-3 h-3" /> Add Level
                </button>
                <button onClick={() => openRoleEdit(roleName)}
                  className="text-xs text-[#3E4048] hover:text-[#FF5900] px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1">
                  <Icon icon="lucide:pencil" className="w-3 h-3" /> Edit Role
                </button>
                <button onClick={() => openRoleDelete(roleName)}
                  className="text-xs text-[#3E4048] hover:text-red-600 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1">
                  <Icon icon="lucide:trash-2" className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#CACDD7]">
                    <th className="text-left px-4 py-2 text-[#3E4048] font-medium w-20">Level</th>
                    <th className="text-left px-4 py-2 text-[#3E4048] font-medium w-16">$/Day</th>
                    <th className="text-left px-4 py-2 text-[#3E4048] font-medium">Description</th>
                    <th className="text-right px-4 py-2 text-[#3E4048] font-medium w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.sort((a, b) => (levelOrder[a.level] ?? 99) - (levelOrder[b.level] ?? 99)).map((r) => (
                    <tr key={r.id} className="border-b border-[#CACDD7]/50 hover:bg-gray-50">
                      <td className="px-4 py-2 text-[#1B1A1C] font-medium whitespace-nowrap">{r.level}</td>
                      <td className="px-4 py-2 text-[#FF5900] font-semibold whitespace-nowrap">
                        {r.price_per_day && !['n/a', '', 'null'].includes(r.price_per_day) ? `$${r.price_per_day}` : '-'}
                      </td>
                      <td className="px-4 py-2 text-[#3E4048] text-xs leading-relaxed">{r.description}</td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <button onClick={() => openLevelEdit(r)} className="text-[#3E4048] hover:text-[#FF5900] px-1.5 py-1" title="Edit level">
                          <Icon icon="lucide:pencil" className="w-3.5 h-3.5 inline" />
                        </button>
                        <button onClick={() => openLevelDelete(r)} className="text-[#3E4048] hover:text-red-600 px-1.5 py-1" title="Delete level">
                          <Icon icon="lucide:trash-2" className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal({ open: false, type: null, form: {}, batchRole: null })}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#1B1A1C] text-lg font-semibold">
                {modal.type === 'role' ? 'Edit Role Name' : modal.type === 'add-level' ? 'Add Level' : 'Edit Level'}
              </h3>
              <button onClick={() => setModal({ open: false, type: null, form: {}, batchRole: null })} className="text-[#3E4048] hover:text-[#1B1A1C]">
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {modal.type === 'role' ? (
                <div>
                  <label className="text-[#1B1A1C] text-sm font-medium block mb-1">Role Name</label>
                  <input value={modal.form.role} onChange={e => setModal(prev => ({ ...prev, form: { ...prev.form, role: e.target.value } }))}
                    className="w-full px-3 py-2 border border-[#CACDD7] rounded-md text-sm focus:outline-none focus:border-[#FF5900]" />
                  <p className="text-xs text-[#3E4048] mt-1">This will update all levels under this role.</p>
                </div>
              ) : (
                <>
                  {modal.type === 'add-level' && (
                    <div>
                      <label className="text-[#1B1A1C] text-sm font-medium block mb-1">Role</label>
                      <input value={modal.form.role} disabled
                        className="w-full px-3 py-2 border border-[#CACDD7] rounded-md text-sm bg-gray-50 text-[#3E4048]" />
                    </div>
                  )}
                  <div>
                    <label className="text-[#1B1A1C] text-sm font-medium block mb-1">Level</label>
                    <select value={modal.form.level} onChange={e => setModal(prev => ({ ...prev, form: { ...prev.form, level: e.target.value } }))}
                      className="w-full px-3 py-2 border border-[#CACDD7] rounded-md text-sm focus:outline-none focus:border-[#FF5900]">
                      {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[#1B1A1C] text-sm font-medium block mb-1">Price per Day (USD)</label>
                    <input value={modal.form.price_per_day} onChange={e => setModal(prev => ({ ...prev, form: { ...prev.form, price_per_day: e.target.value } }))}
                      placeholder="e.g. 280"
                      className="w-full px-3 py-2 border border-[#CACDD7] rounded-md text-sm focus:outline-none focus:border-[#FF5900]" />
                  </div>
                  <div>
                    <label className="text-[#1B1A1C] text-sm font-medium block mb-1">Description</label>
                    <textarea value={modal.form.description} onChange={e => setModal(prev => ({ ...prev, form: { ...prev.form, description: e.target.value } }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#CACDD7] rounded-md text-sm focus:outline-none focus:border-[#FF5900] resize-none" />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal({ open: false, type: null, form: {}, batchRole: null })}
                className="px-4 py-2 text-sm font-medium text-[#3E4048] bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-[#FF5900] rounded-md hover:bg-orange-600 flex items-center gap-2">
                {modal.type === 'add-level' ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManpowerPricing