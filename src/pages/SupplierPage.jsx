import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { useEnquiries } from '../hooks/useEnquiries'
import { useResponses } from '../hooks/useResponses'
import { EnquiryCard } from '../components/EnquiryCard'
import { C } from '../lib/constants'

const inp = { background: '#0F0E0C', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', width: '100%' }
const lbl = { fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5, display: 'block' }

function ResponseForm({ onSubmit, onCancel, loading }) {
  const [price, setPrice]       = useState('')
  const [location, setLocation] = useState('')
  const [mill, setMill]         = useState('')
  const [grade, setGrade]       = useState('')
  const [note, setNote]         = useState('')
  const [mills, setMills]       = useState([])
  const [grades, setGrades]     = useState([])

  useEffect(() => {
    supabase.from('master_data').select('*').in('id', ['mills', 'grades']).then(({ data }) => {
      if (data) {
        setMills(data.find(d => d.id === 'mills')?.items || [])
        setGrades(data.find(d => d.id === 'grades')?.items || [])
      }
    })
  }, [])

  const submit = (e) => {
    e.preventDefault()
    if (!price || !location) return
    onSubmit({ pricePerKg: parseFloat(price), location, mill, grade, note })
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div><label style={lbl}>Your Price (₹/kg)</label><input style={inp} type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 900" required /></div>
        <div><label style={lbl}>Your Location</label><input style={inp} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Andheri, Mumbai" required /></div>
        <div><label style={lbl}>Notes</label><input style={inp} value={note} onChange={e => setNote(e.target.value)} placeholder="Delivery time, stock…" /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <label style={lbl}>Mill</label>
          <select style={inp} value={mill} onChange={e => {
            if (e.target.value === '__add__') {
              const newMill = prompt('Enter new mill:')
              if (newMill?.trim()) {
                setMills(prev => [...prev, newMill.trim()])
                setMill(newMill.trim())
                supabase.from('master_data').upsert({ id: 'mills', items: [...mills, newMill.trim()] })
              }
            } else setMill(e.target.value)
          }}>
            <option value="">— Select Mill —</option>
            {mills.map(m => <option key={m}>{m}</option>)}
            <option value="__add__">+ Add new mill…</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Grade</label>
          <select style={inp} value={grade} onChange={e => {
            if (e.target.value === '__add__') {
              const newGrade = prompt('Enter new grade:')
              if (newGrade?.trim()) {
                setGrades(prev => [...prev, newGrade.trim()])
                setGrade(newGrade.trim())
                supabase.from('master_data').upsert({ id: 'grades', items: [...grades, newGrade.trim()] })
              }
            } else setGrade(e.target.value)
          }}>
            <option value="">— Select Grade —</option>
            {grades.map(g => <option key={g}>{g}</option>)}
            <option value="__add__">+ Add new grade…</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={loading} style={{ background: C.accent, color: '#0F0E0C', border: 'none', borderRadius: 5, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600 }}>
          {loading ? 'Sending…' : 'Submit Response'}
        </button>
        <button type="button" onClick={onCancel} style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 5, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function SupplierPage({ tab }) {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { enquiries, loading: eLoading } = useEnquiries({ role: 'supplier' })
  const { responses, loading: rLoading, createResponse } = useResponses({ role: 'supplier', userId: user?.id })
  const [responding, setResponding] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const myReplied = new Set(responses.map(r => r.enquiry_id))

  const handleRespond = async (enquiryId, form) => {
    setSubmitting(true)
    try {
      await createResponse({ enquiryId, ...form })
      setResponding(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const th = { fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left', borderBottom: `1px solid ${isDark ? C.border : '#E8E5E0'}`, background: isDark ? C.card : '#F5F3EF', whiteSpace: 'nowrap' }
  const td = { fontSize: 12.5, color: isDark ? C.text : '#1A1A1A', fontFamily: '"DM Mono", monospace', padding: '11px 16px', borderBottom: `1px solid ${isDark ? C.border : '#F0EDE8'}`, verticalAlign: 'middle' }

  // ── My Responses tab ────────────────────────────────────────────────
  if (tab === 'responses') return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Supplier · History</div>
        <div style={{ fontSize: 22, fontFamily: '"Playfair Display", serif', color: isDark ? C.text : '#1A1A1A', fontWeight: 700 }}>My Responses</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Responses', value: responses.length, color: C.accent },
          { label: 'Quoted to Buyer', value: responses.filter(r => r.enquiries?.status === 'quoted').length, color: C.green },
          { label: 'Pending',         value: responses.filter(r => r.enquiries?.status === 'responded').length, color: C.blue },
        ].map(s => (
          <div key={s.label} style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 10, padding: '14px 18px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: '"Playfair Display", serif' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['#', 'Date', 'Paper Type', 'Qty', 'My Price', 'Location', 'Note', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rLoading && <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: C.muted }}>Loading…</td></tr>}
            {!rLoading && responses.length === 0 && <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: C.muted }}>No responses yet</td></tr>}
            {responses.map((r, i) => {
              const sc = { open: '#6E9EC8', responded: '#C8A96E', quoted: '#6EC89E', closed: '#666' }[r.enquiries?.status] || '#666'
              return (
                <tr key={r.id}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? '#161616' : '#FAFAF8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  <td style={{ ...td, color: C.muted, fontSize: 11 }}>{String(i+1).padStart(2,'0')}</td>
                  <td style={{ ...td, color: C.muted, fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{r.enquiries?.paper_type || '—'}</td>
                  <td style={td}>{r.enquiries?.quantity?.toLocaleString()} {r.enquiries?.unit}</td>
                  <td style={td}><span style={{ color: C.green, fontWeight: 600 }}>₹{r.price_per_kg}/kg</span></td>
                  <td style={{ ...td, color: C.muted }}>{r.location}</td>
                  <td style={{ ...td, color: C.muted }}>{r.note || '—'}</td>
                  <td style={td}>
                    <span style={{ background: sc + '18', color: sc, border: `1px solid ${sc}33`, borderRadius: 4, padding: '2px 8px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {r.enquiries?.status || '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace' }}>Showing {responses.length} responses</div>
    </div>
  )

  // ── Browse Enquiries tab ─────────────────────────────────────────────
  const open = enquiries.filter(e => e.status === 'open' || e.status === 'responded')

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Supplier · Enquiries</div>
        <div style={{ fontSize: 22, fontFamily: '"Playfair Display", serif', color: isDark ? C.text : '#1A1A1A', fontWeight: 700 }}>Browse Enquiries</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Open Enquiries',  value: open.length,                     color: C.blue },
          { label: 'My Responses',    value: responses.length,                 color: C.green },
          { label: 'Pending Reply',   value: open.filter(e => !myReplied.has(e.id)).length, color: C.accent },
        ].map(s => (
          <div key={s.label} style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 10, padding: '14px 18px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: '"Playfair Display", serif' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {eLoading && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>Loading…</div>}
      {!eLoading && open.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>No open enquiries at the moment.</div>}
      {open.map(enq => {
        const replied = myReplied.has(enq.id)
        return (
          <EnquiryCard key={enq.id} enquiry={enq} hideProfile={true} footer={
            replied ? (
              <span style={{ background: C.green + '22', color: C.green, border: `1px solid ${C.green}44`, borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>
                Responded ✓
              </span>
            ) : responding === enq.id ? (
              <ResponseForm onSubmit={form => handleRespond(enq.id, form)} onCancel={() => setResponding(null)} loading={submitting} />
            ) : (
              <button onClick={() => setResponding(enq.id)} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 700 }}>
                Respond with Price
              </button>
            )
          } />
        )
      })}
    </div>
  )
}