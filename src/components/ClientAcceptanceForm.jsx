import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '@iconify/react'

const initialForm = {
  client_name: '',
  project_name: '',
  point_of_contact: '',
  email_address: '',
  project_type: [],
  project_type_other: '',
  target_platform: [],
  target_platform_other: '',
  timezone: '',
  expected_start_date: '',
  expected_deadline: '',
  budget_range: '',
  project_document_link: '',

  deliverables: [],

  reviewer: [],
  reviewer_other: '',
  review_rounds: '',
  expected_review_time: '',
  approval_basis: [],

  communication_tool: [],
  communication_tool_other: '',
  weekly_target_meeting: [],
  preferred_meeting_time: '',
  preferred_meeting_time_other: '',
  daily_team_syncup: [],
  preferred_syncup_time: '',
  preferred_syncup_time_other: '',
  training_onboarding: [],

  game_engine: [],
  game_engine_other: '',
  technical_requirements: '',
  tools_software: '',
  performance_constraints: '',

  client_signature: '',
  signature_date: '',
}

const checkboxClass = 'accent-[#FF5900] w-4 h-4 cursor-pointer'
const labelClass = 'text-[#1B1A1C] text-sm'
const inputClass = 'w-full border border-[#CACDD7] rounded-lg px-3 py-2 text-sm text-[#1B1A1C] focus:outline-none focus:ring-2 focus:ring-[#FF5900]/40 focus:border-[#FF5900]'
const textareaClass = 'w-full border border-[#CACDD7] rounded-lg px-3 py-2 text-sm text-[#1B1A1C] focus:outline-none focus:ring-2 focus:ring-[#FF5900]/40 focus:border-[#FF5900] resize-none'

function MultiCheckbox({ label, options, value, onChange, otherValue, onOtherChange, otherLabel }) {
  return (
    <div>
      <p className="text-[#1B1A1C] text-sm font-medium mb-2">{label}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className={checkboxClass} checked={value.includes(opt)} onChange={() => onChange(opt)} />
            <span className={labelClass}>{opt}</span>
          </label>
        ))}
      </div>
      {otherLabel && (
        <input className={`${inputClass} mt-2 max-w-xs`} placeholder={otherLabel} value={otherValue} onChange={onOtherChange} />
      )}
    </div>
  )
}

function RadioGroup({ label, options, value, onChange, otherValue, onOtherChange, otherLabel }) {
  return (
    <div>
      <p className="text-[#1B1A1C] text-sm font-medium mb-2">{label}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name={label} className={checkboxClass} checked={value === opt} onChange={() => onChange(opt)} />
            <span className={labelClass}>{opt}</span>
          </label>
        ))}
      </div>
      {otherLabel && value === 'Others (Specify)' && (
        <input className={`${inputClass} mt-2 max-w-xs`} placeholder={otherLabel} value={otherValue} onChange={onOtherChange} />
      )}
    </div>
  )
}

function ClientAcceptanceForm() {
  const [briefs, setBriefs] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBriefs()
  }, [])

  const fetchBriefs = async () => {
    try {
      const { data } = await supabase.from('client_project_briefs').select('*').order('created_at', { ascending: false })
      setBriefs(data || [])
    } catch {
      setBriefs([])
    } finally {
      setLoading(false)
    }
  }

  const toggleArray = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
    }))
  }

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const addDeliverable = () => {
    setForm(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, { deliverable: '', description: '', acceptance_criteria: '', reference_link: '', quantity: '', service_type: '' }],
    }))
  }

  const updateDeliverable = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.deliverables]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, deliverables: updated }
    })
  }

  const removeDeliverable = (index) => {
    setForm(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      expected_start_date: form.expected_start_date || null,
      expected_deadline: form.expected_deadline || null,
      signature_date: form.signature_date || null,
      status: 'submitted',
    }
    const { error } = await supabase.from('client_project_briefs').insert(payload)
    setSaving(false)
    if (error) return
    setForm(initialForm)
    setView('list')
    fetchBriefs()
  }

  const openNewForm = () => {
    setForm(initialForm)
    setView('form')
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-[#1B1A1C] text-xl font-semibold mb-4">Client Acceptance Form</h2>
        <div className="text-[#3E4048]">Loading...</div>
      </div>
    )
  }

  if (view === 'form') {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-[#3E4048] hover:text-[#1B1A1C] transition-colors cursor-pointer">
              <Icon icon="lucide:arrow-left" className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h2 className="text-[#1B1A1C] text-xl font-semibold">Client Project Brief & Acceptance Form</h2>
            <div />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1 */}
            <section>
              <h3 className="text-[#FF5900] text-base font-semibold mb-4 pb-2 border-b border-[#CACDD7]">Section 1: Basic Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass + ' font-medium'}>Client / Studio Name <span className="text-red-500">*</span></label>
                  <input className={inputClass} required value={form.client_name} onChange={e => setField('client_name', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass + ' font-medium'}>Project Name <span className="text-red-500">*</span></label>
                  <input className={inputClass} required value={form.project_name} onChange={e => setField('project_name', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass + ' font-medium'}>Point of Contact</label>
                  <input className={inputClass} value={form.point_of_contact} onChange={e => setField('point_of_contact', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass + ' font-medium'}>Email Address</label>
                  <input className={inputClass} type="email" value={form.email_address} onChange={e => setField('email_address', e.target.value)} />
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <MultiCheckbox label="Project Type" options={['Project Base', 'Staff Augmentation']} value={form.project_type} onChange={v => toggleArray('project_type', v)} otherValue={form.project_type_other} onOtherChange={e => setField('project_type_other', e.target.value)} otherLabel="Others (Specify)" />
                <MultiCheckbox label="Target Platform" options={['PC', 'Mobile', 'Web', 'Console', 'Not sure yet']} value={form.target_platform} onChange={v => toggleArray('target_platform', v)} otherValue={form.target_platform_other} onOtherChange={e => setField('target_platform_other', e.target.value)} otherLabel="Others (Specify)" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass + ' font-medium'}>Timezone</label>
                  <input className={inputClass} value={form.timezone} onChange={e => setField('timezone', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass + ' font-medium'}>Expected Start Date</label>
                  <input className={inputClass} type="date" value={form.expected_start_date} onChange={e => setField('expected_start_date', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass + ' font-medium'}>Expected Deadline</label>
                  <input className={inputClass} type="date" value={form.expected_deadline} onChange={e => setField('expected_deadline', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass + ' font-medium'}>Budget Range</label>
                  <input className={inputClass} value={form.budget_range} onChange={e => setField('budget_range', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass + ' font-medium'}>Link to the Project Document</label>
                  <input className={inputClass} value={form.project_document_link} onChange={e => setField('project_document_link', e.target.value)} />
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-[#FF5900] text-base font-semibold mb-4 pb-2 border-b border-[#CACDD7]">Section 2: What You Want Us to Create</h3>
              <div className="space-y-3">
                {form.deliverables.map((del, i) => (
                  <div key={i} className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-[#1B1A1C]">Deliverable #{i + 1}</span>
                      <button type="button" onClick={() => removeDeliverable(i)} className="text-red-500 hover:text-red-700 cursor-pointer">
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Deliverable</label>
                        <input className={inputClass} value={del.deliverable} onChange={e => updateDeliverable(i, 'deliverable', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Description</label>
                        <input className={inputClass} value={del.description} onChange={e => updateDeliverable(i, 'description', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Acceptance Criteria</label>
                        <input className={inputClass} value={del.acceptance_criteria} onChange={e => updateDeliverable(i, 'acceptance_criteria', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Reference Link</label>
                        <input className={inputClass} value={del.reference_link} onChange={e => updateDeliverable(i, 'reference_link', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Quantity</label>
                        <input className={inputClass} type="number" min="1" value={del.quantity} onChange={e => updateDeliverable(i, 'quantity', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Service Type</label>
                        <input className={inputClass} value={del.service_type} onChange={e => updateDeliverable(i, 'service_type', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addDeliverable} className="flex items-center gap-2 text-[#FF5900] text-sm font-semibold hover:underline cursor-pointer">
                  <Icon icon="lucide:plus-circle" className="w-4 h-4" />
                  Add Deliverable
                </button>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="text-[#FF5900] text-base font-semibold mb-4 pb-2 border-b border-[#CACDD7]">Section 3: How Will You Review and Approve the Work?</h3>
              <div className="space-y-4">
                <MultiCheckbox label="Who will review and approve this?" options={['Client', "Client's Team", 'Stakeholders', "Client's QA"]} value={form.reviewer} onChange={v => toggleArray('reviewer', v)} otherValue={form.reviewer_other} onOtherChange={e => setField('reviewer_other', e.target.value)} otherLabel="Others (Specify)" />
                <RadioGroup label="How many review rounds are included?" options={['1', '2', '3', 'Not Sure']} value={form.review_rounds} onChange={v => setField('review_rounds', v)} />
                <RadioGroup label="Expected review time" options={['1 business day', '2 business day', '3 business day', 'Not Sure']} value={form.expected_review_time} onChange={v => setField('expected_review_time', v)} />
                <MultiCheckbox label="What will we use as the basis for approval?" options={['The acceptance expectations defined in this Section 2 (Acceptance Criteria)']} value={form.approval_basis} onChange={v => toggleArray('approval_basis', v)} />
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h3 className="text-[#FF5900] text-base font-semibold mb-4 pb-2 border-b border-[#CACDD7]">Section 4: Project Governance</h3>
              <div className="space-y-4">
                <MultiCheckbox label="Communication Tool" options={['Discord', 'Slack']} value={form.communication_tool} onChange={v => toggleArray('communication_tool', v)} otherValue={form.communication_tool_other} onOtherChange={e => setField('communication_tool_other', e.target.value)} otherLabel="Others (Specify)" />

                <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-4">
                  <p className="text-sm font-semibold text-[#1B1A1C] mb-3">IF PROJECT BASE</p>
                  <div className="space-y-3">
                    <MultiCheckbox label="Weekly target meeting" options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']} value={form.weekly_target_meeting} onChange={v => toggleArray('weekly_target_meeting', v)} />
                    <RadioGroup label="Preferred target meeting time (No graveyard shift)" options={['10:00 AM – 12:00 PM', '1:00 PM – 3:00 PM', '3:00 PM – 5:00 PM']} value={form.preferred_meeting_time} onChange={v => setField('preferred_meeting_time', v)} otherValue={form.preferred_meeting_time_other} onOtherChange={e => setField('preferred_meeting_time_other', e.target.value)} otherLabel="Others (Specify)" />
                  </div>
                </div>

                <div className="bg-[#F9FAFB] border border-[#CACDD7]/30 rounded-xl p-4">
                  <p className="text-sm font-semibold text-[#1B1A1C] mb-3">IF STAFF AUGMENTATION</p>
                  <div className="space-y-3">
                    <MultiCheckbox label="Daily team sync-up" options={['Everyday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']} value={form.daily_team_syncup} onChange={v => toggleArray('daily_team_syncup', v)} />
                    <RadioGroup label="Preferred team sync-up time (No graveyard shift)" options={['10:00 AM – 12:00 PM', '1:00 PM – 3:00 PM', '3:00 PM – 5:00 PM']} value={form.preferred_syncup_time} onChange={v => setField('preferred_syncup_time', v)} otherValue={form.preferred_syncup_time_other} onOtherChange={e => setField('preferred_syncup_time_other', e.target.value)} otherLabel="Others (Specify)" />
                    <MultiCheckbox label="Training & onboarding" options={['Client', 'Exodia', 'Third Party']} value={form.training_onboarding} onChange={v => toggleArray('training_onboarding', v)} />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h3 className="text-[#FF5900] text-base font-semibold mb-4 pb-2 border-b border-[#CACDD7]">Section 5: Technical Details</h3>
              <div className="space-y-4">
                <MultiCheckbox label="Game Engine (if known)" options={['Unity', 'Unreal', 'Not sure yet']} value={form.game_engine} onChange={v => toggleArray('game_engine', v)} otherValue={form.game_engine_other} onOtherChange={e => setField('game_engine_other', e.target.value)} otherLabel="Others (Specify)" />
                <div>
                  <label className={labelClass + ' font-medium'}>Technical requirements (if any): File format, Naming convention, Output format and etc.</label>
                  <textarea className={textareaClass} rows={3} value={form.technical_requirements} onChange={e => setField('technical_requirements', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass + ' font-medium'}>Tools & Software Required</label>
                  <textarea className={textareaClass} rows={2} value={form.tools_software} onChange={e => setField('tools_software', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass + ' font-medium'}>Performance or platform constraints</label>
                  <textarea className={textareaClass} rows={2} value={form.performance_constraints} onChange={e => setField('performance_constraints', e.target.value)} />
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h3 className="text-[#FF5900] text-base font-semibold mb-4 pb-2 border-b border-[#CACDD7]">Section 6: Client Confirmation</h3>
              <p className="text-[#3E4048] text-xs mb-4 italic">By signing this form, the client confirms that the deliverables, specifications, and acceptance expectations stated above are accurate and approved. This document will be used as the basis for project scoping, quotation, production execution, and QA validation. Any changes after approval may require a formal revision and may impact cost, timeline, or delivery scope.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass + ' font-medium'}>Client Name & Signature</label>
                  <input className={inputClass} value={form.client_signature} onChange={e => setField('client_signature', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass + ' font-medium'}>Date</label>
                  <input className={inputClass} type="date" value={form.signature_date} onChange={e => setField('signature_date', e.target.value)} />
                </div>
              </div>
            </section>

            <div className="flex gap-3 pt-4 border-t border-[#CACDD7]">
              <button type="submit" disabled={saving} className="bg-[#1B1A1C] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
                {saving ? 'Submitting...' : 'Submit Acceptance Form'}
              </button>
              <button type="button" onClick={() => setView('list')} className="text-[#3E4048] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#1B1A1C] text-xl font-semibold mb-1">Client Acceptance Form</h2>
            <p className="text-[#3E4048] text-sm">Client project briefs and acceptance criteria submissions</p>
          </div>
          <button onClick={openNewForm} className="bg-[#1B1A1C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer">
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Create Acceptance Form
          </button>
        </div>

        {briefs.length === 0 ? (
          <div className="text-center py-16">
            <Icon icon="lucide:file-text" className="w-12 h-12 text-[#CACDD7] mx-auto mb-4" />
            <p className="text-[#3E4048] text-sm">No acceptance forms yet. Click "Create Acceptance Form" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#CACDD7]">
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap">Client</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap">Project</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-[#3E4048] font-medium whitespace-nowrap hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {briefs.map(b => (
                  <tr key={b.id} className="border-b border-[#CACDD7]/50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[#1B1A1C] font-medium whitespace-nowrap">{b.client_name}</td>
                    <td className="px-4 py-3 text-[#1B1A1C] whitespace-nowrap">{b.project_name}</td>
                    <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden md:table-cell">{b.point_of_contact || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        b.status === 'approved' ? 'bg-green-100 text-green-700'
                        : b.status === 'submitted' ? 'bg-blue-100 text-blue-700'
                        : b.status === 'under_review' ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#3E4048] whitespace-nowrap hidden lg:table-cell">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientAcceptanceForm