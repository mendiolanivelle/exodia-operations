import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '@iconify/react'

const categories = ['Generalist', 'Specialist', 'Engineering', 'Audio', 'Cinematics', 'Production']
const levels = ['Director', 'Senior', 'Mid', 'Junior']
const levelOrder = { 'Director': 0, 'Senior': 1, 'Mid': 2, 'Junior': 3 }

const emptyForm = { category: 'Generalist', sub_category: '', role: '', level: 'Director', price_per_day: '', description: '' }

function ManpowerPricing() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Generalist')
  const [modal, setModal] = useState({ open: false, editingId: null, form: emptyForm })
  const [saving, setSaving] = useState(false)

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

  const openAdd = (category) => {
    setModal({ open: true, editingId: null, form: { ...emptyForm, category } })
  }

  const openEdit = (record) => {
    setModal({
      open: true,
      editingId: record.id,
      form: {
        category: record.category || '',
        sub_category: record.sub_category || '',
        role: record.role || '',
        level: record.level || 'Director',
        price_per_day: record.price_per_day || '',
        description: record.description || '',
      }
    })
  }

  const setFormField = (field, value) => {
    setModal(prev => ({ ...prev, form: { ...prev.form, [field]: value } }))
  }

  const handleSave = async () => {
    const { editingId, form } = modal
    if (!form.role || !form.level) return
    setSaving(true)
    const payload = {
      category: form.category,
      sub_category: form.sub_category || form.role,
      role: form.role,
      level: form.level,
      price_per_day: form.price_per_day || null,
      description: form.description || '',
    }
    try {
      if (editingId) {
        const { error } = await supabase.from('manpower_pricing').update(payload).eq('id', editingId)
        if (error) { alert('Update failed: ' + error.message); return }
      } else {
        const { error } = await supabase.from('manpower_pricing').insert(payload)
        if (error) { alert('Create failed: ' + error.message); return }
      }
      setModal({ open: false, editingId: null, form: emptyForm })
      await fetchData()
    } catch (err) {
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (record) => {
    if (!window.confirm(`Delete "${record.role} - ${record.level}"?`)) return
    try {
      const { error } = await supabase.from('manpower_pricing').delete().eq('id', record.id)
      if (error) { alert('Delete failed: ' + error.message); return }
      await fetchData()
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
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
        <button onClick={() => openAdd(activeCategory)}
          className="ml-auto px-4 py-2 rounded-md text-sm font-medium bg-[#1B1A1C] text-white hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Icon icon="lucide:plus" className="w-4 h-4" /> Add Role
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).length === 0 && (
          <p className="text-[#3E4048] text-sm">No roles in this category.</p>
        )}
        {Object.entries(grouped).map(([roleName, rows]) => (
          <div key={roleName}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#1B1A1C] text-base font-semibold">{roleName}</h3>
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
                        <button onClick={() => openEdit(r)} className="text-[#3E4048] hover:text-[#FF5900] px-1.5 py-1" title="Edit">
                          <Icon icon="lucide:pencil" className="w-3.5 h-3.5 inline" />
                        </button>
                        <button onClick={() => confirmDelete(r)} className="text-[#3E4048] hover:text-red-600 px-1.5 py-1" title="Delete">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal({ open: false, editingId: null, form: emptyForm })}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#1B1A1C] text-lg font-semibold">{modal.editingId ? 'Edit Role' : 'Add Role'}</h3>
              <button onClick={() => setModal({ open: false, editingId: null, form: emptyForm })} className="text-[#3E4048] hover:text-[#1B1A1C]">
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#1B1A1C] text-sm font-medium block mb-1">Category</label>
                <select value={modal.form.category} onChange={e => setFormField('category', e.target.value)}
                  className="w-full px-3 py-2 border border-[#CACDD7] rounded-md text-sm focus:outline-none focus:border-[#FF5900]">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[#1B1A1C] text-sm font-medium block mb-1">Role Name</label>
                <input value={modal.form.role} onChange={e => setFormField('role', e.target.value)}
                  className="w-full px-3 py-2 border border-[#CACDD7] rounded-md text-sm focus:outline-none focus:border-[#FF5900]" />
              </div>

              <div>
                <label className="text-[#1B1A1C] text-sm font-medium block mb-1">Level</label>
                <select value={modal.form.level} onChange={e => setFormField('level', e.target.value)}
                  className="w-full px-3 py-2 border border-[#CACDD7] rounded-md text-sm focus:outline-none focus:border-[#FF5900]">
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[#1B1A1C] text-sm font-medium block mb-1">Price per Day (USD)</label>
                <input value={modal.form.price_per_day} onChange={e => setFormField('price_per_day', e.target.value)}
                  placeholder="e.g. 280"
                  className="w-full px-3 py-2 border border-[#CACDD7] rounded-md text-sm focus:outline-none focus:border-[#FF5900]" />
              </div>

              <div>
                <label className="text-[#1B1A1C] text-sm font-medium block mb-1">Description</label>
                <textarea value={modal.form.description} onChange={e => setFormField('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#CACDD7] rounded-md text-sm focus:outline-none focus:border-[#FF5900] resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal({ open: false, editingId: null, form: emptyForm })}
                className="px-4 py-2 text-sm font-medium text-[#3E4048] bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} disabled={saving || !modal.form.role}
                className="px-4 py-2 text-sm font-medium text-white bg-[#FF5900] rounded-md hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
                {saving && <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />}
                {modal.editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManpowerPricing