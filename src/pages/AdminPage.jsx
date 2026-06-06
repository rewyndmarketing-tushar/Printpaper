import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { useEnquiries } from '../hooks/useEnquiries'
import { useResponses, useQuotes } from '../hooks/useResponses'
import { EnquiryForm } from '../components/EnquiryForm'
import { C, PAPER_TYPES, COATINGS, SHADES, GSM_OPTIONS } from '../lib/constants'
import { supabase } from '../lib/supabase'
import { NegotiationPanel } from '../components/NegotiationPanel'
import MasterPage from './MasterPage'
import UserManagerPage from './UserManagerPage'
import DashboardPage from './DashboardPage'

// ── Shared styles ─────────────────────────────────────────────────────
const getStyles = (isDark) => ({
  th: { fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left', borderBottom: `1px solid ${isDark ? C.border : '#E8E5E0'}`, background: isDark ? C.card : '#F5F3EF', whiteSpace: 'nowrap' },
  td: { fontSize: 12.5, color: isDark ? C.text : '#1A1A1A', fontFamily: '"DM Mono", monospace', padding: '11px 16px', borderBottom: `1px solid ${isDark ? C.border : '#F0EDE8'}`, verticalAlign: 'middle' },
  inp: { background: isDark ? '#0F0F0F' : '#F5F3EF', border: `1px solid ${isDark ? '#2A2A2A' : '#E0DDD8'}`, borderRadius: 6, padding: '8px 12px', color: isDark ? C.text : '#1A1A1A', fontSize: 12, fontFamily: '"DM Mono", monospace', outline: 'none', width: '100%' },
})

const SectionTitle = ({ title, subtitle, isDark }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{subtitle}</div>
    <div style={{ fontSize: 22, fontFamily: '"Playfair Display", Georgia, serif', color: isDark ? C.text : '#1A1A1A', fontWeight: 700 }}>{title}</div>
  </div>
)

// ── Edit Modal ────────────────────────────────────────────────────────
function EditModal({ title, fields, data, onSave, onClose, isDark }) {
  const [form, setForm] = useState({ ...data })
  const [saving, setSaving] = useState(false)
  const { inp } = getStyles(isDark)

  const handleSave = async () => {
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000BB', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 12, padding: 28, width: 480, boxShadow: '0 24px 80px #000', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ fontSize: 16, fontFamily: '"Playfair Display", serif', color: isDark ? C.text : '#1A1A1A', fontWeight: 700, marginBottom: 20 }}>{title}</div>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</div>
            {f.options ? (
              <select style={inp} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input style={inp} type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            )}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 7, padding: '10px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button onClick={onClose} style={{ background: 'transparent', color: C.muted, border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 7, padding: '10px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── All Enquiries ─────────────────────────────────────────────────────
function AllEnquiries({ setTab }) {
  const { isDark } = useTheme()
  const { enquiries, loading, refetch: fetchEnquiries } = useEnquiries({ role: 'admin' })
  const { responses } = useResponses({ role: 'admin' })
  const { quotes } = useQuotes({ role: 'admin' })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editEnq, setEditEnq] = useState(null)
  const { th, td } = getStyles(isDark)

  const filtered = enquiries.filter(e => {
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    const matchSearch = search.trim() === '' ||
      e.paper_type?.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.name?.toLowerCase().includes(search.toLowerCase())
    const notClosed = e.status !== 'closed'
    return matchStatus && matchSearch && notClosed
  })

  const stats = [
    { label: 'Open',      value: enquiries.filter(e => e.status === 'open').length,      color: '#6E9EC8' },
    { label: 'Responded', value: enquiries.filter(e => e.status === 'responded').length,  color: '#C8A96E' },
    { label: 'Quoted',    value: enquiries.filter(e => e.status === 'quoted').length,     color: '#6EC89E' },
    { label: 'Total',     value: enquiries.length,                                         color: isDark ? C.text : '#1A1A1A' },
  ]

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <SectionTitle title="All Enquiries" subtitle="Admin · Overview" isDark={isDark} />
        <button onClick={() => setTab('new')} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 7, padding: '9px 18px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
          + New Enquiry
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} onClick={() => setFilterStatus(s.label.toLowerCase() === 'total' ? 'all' : s.label.toLowerCase())}
            style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${filterStatus === (s.label.toLowerCase() === 'total' ? 'all' : s.label.toLowerCase()) ? s.color + '66' : isDark ? C.border : '#E8E5E0'}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: '"Playfair Display", serif' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input placeholder="Search by paper type or buyer..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: isDark ? C.card : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 7, padding: '8px 14px', color: isDark ? C.text : '#1A1A1A', fontSize: 12, fontFamily: '"DM Mono", monospace', outline: 'none' }} />
        {['all', 'open', 'responded', 'quoted', 'closed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{ background: filterStatus === s ? '#C8A96E18' : 'transparent', color: filterStatus === s ? '#C8A96E' : C.muted, border: `1px solid ${filterStatus === s ? '#C8A96E44' : isDark ? C.border : '#E8E5E0'}`, borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace', textTransform: 'capitalize' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['#', 'Date', 'Buyer', 'Paper Type', 'GSM', 'Coating', 'Shade', 'Qty', 'Supplier Rate', 'Buyer Rate', 'Responses', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={13} style={{ ...td, textAlign: 'center', color: C.muted }}>Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={13} style={{ ...td, textAlign: 'center', color: C.muted }}>No enquiries found</td></tr>}
            {filtered.map((e, i) => {
              const count = responses.filter(r => r.enquiry_id === e.id).length
              const resp = responses.find(r => r.enquiry_id === e.id)
              const quote = quotes.find(q => q.enquiry_id === e.id)
              const sc = { open: '#6E9EC8', responded: '#C8A96E', quoted: '#6EC89E', closed: '#666' }[e.status] || '#666'
              return (
                <tr key={e.id}
                  onMouseEnter={ev => ev.currentTarget.style.background = isDark ? '#161616' : '#FAFAF8'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  <td style={{ ...td, color: C.muted, fontSize: 11 }}>{String(i+1).padStart(2,'0')}</td>
                  <td style={{ ...td, color: C.muted, fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td style={{ ...td, color: '#6E9EC8', fontWeight: 500 }}>{e.profiles?.name || '—'}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{e.paper_type}</td>
                  <td style={{ ...td, color: C.muted }}>{e.gsm}</td>
                  <td style={{ ...td, color: C.muted }}>{e.coating}</td>
                  <td style={{ ...td, color: C.muted }}>{e.shade}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{e.quantity?.toLocaleString()} {e.unit}</td>
                  <td style={td}>{resp ? <span style={{ color: C.green, fontWeight: 600 }}>₹{resp.price_per_kg}/kg</span> : <span style={{ color: C.muted }}>—</span>}</td>
                  <td style={td}>{quote ? <span style={{ color: C.accent, fontWeight: 600 }}>₹{quote.quoted_price}/kg</span> : <span style={{ color: C.muted }}>—</span>}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <span style={{ background: count > 0 ? C.green+'22' : C.muted+'22', color: count > 0 ? C.green : C.muted, borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>{count}</span>
                  </td>
                  <td style={td}>
                    <span style={{ background: sc+'18', color: sc, border: `1px solid ${sc}33`, borderRadius: 4, padding: '2px 8px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{e.status}</span>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => setEditEnq(e)} style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}33`, borderRadius: 5, padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>Edit</button>
                      <button onClick={async () => {
                        if (!confirm(`Delete enquiry for ${e.profiles?.name}? All responses and quotes will also be deleted.`)) return
                        await supabase.from('enquiries').delete().eq('id', e.id)
                        fetchEnquiries()
                      }} style={{ background: '#2A1010', color: C.red, border: `1px solid ${C.red}33`, borderRadius: 5, padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace' }}>Showing {filtered.length} of {enquiries.length} enquiries</div>

      {/* Edit Enquiry Modal */}
      {editEnq && (
        <EditModal
          title="Edit Enquiry"
          isDark={isDark}
          data={{ paper_type: editEnq.paper_type, gsm: editEnq.gsm, coating: editEnq.coating, shade: editEnq.shade, quantity: editEnq.quantity, unit: editEnq.unit, notes: editEnq.notes, status: editEnq.status }}
          fields={[
            { key: 'paper_type', label: 'Paper Type', options: PAPER_TYPES },
            { key: 'gsm',        label: 'GSM',        options: GSM_OPTIONS },
            { key: 'coating',    label: 'Coating',    options: COATINGS },
            { key: 'shade',      label: 'Shade',      options: SHADES },
            { key: 'quantity',   label: 'Quantity',   type: 'number' },
            { key: 'unit',       label: 'Unit',       options: ['sheets', 'kg', 'reams'] },
            { key: 'notes',      label: 'Notes' },
            { key: 'status',     label: 'Status',     options: ['open', 'responded', 'quoted', 'closed'] },
          ]}
          onSave={async (form) => {
            await supabase.from('enquiries').update(form).eq('id', editEnq.id)
            fetchEnquiries()
          }}
          onClose={() => setEditEnq(null)}
        />
      )}
    </div>
  )
}

// ── Supplier Responses ────────────────────────────────────────────────
function SupplierResponses() {
  const { isDark } = useTheme()
  const { responses, loading, refetch } = useResponses({ role: 'admin' })
  const { quotes, sendQuote } = useQuotes({ role: 'admin' })
  const { enquiries } = useEnquiries({ role: 'admin' })
  const [prices, setPrices]   = useState({})
  const [msgs, setMsgs]       = useState({})
  const [sending, setSending] = useState(null)
  const [editResp, setEditResp] = useState(null)
  const { inp } = getStyles(isDark)

  const handleSend = async (resp) => {
    const price = prices[resp.id]
    if (!price) return
    const enq = enquiries.find(e => e.id === resp.enquiry_id)
    setSending(resp.id)
    try {
      await sendQuote({ enquiryId: resp.enquiry_id, purchaserId: enq?.purchaser_id, responseId: resp.id, supplierPrice: resp.price_per_kg, quotedPrice: parseFloat(price), message: msgs[resp.id] || '' })
    } catch (err) { alert(err.message) }
    finally { setSending(null) }
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <SectionTitle title="Supplier Responses" subtitle="Admin · Private" isDark={isDark} />
      <div style={{ background: '#1A1200', border: '1px solid #C8A96E22', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#C8A96E99', fontFamily: '"DM Mono", monospace' }}>
        🔒 Prices are private — only you see these
      </div>
      {loading && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>Loading…</div>}
      {!loading && responses.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>No supplier responses yet.</div>}

      {responses.map(resp => {
        const alreadyQuoted = quotes.some(q => q.supplier_response_id === resp.id)
        const sentQuote = quotes.find(q => q.supplier_response_id === resp.id)
        const enq = enquiries.find(e => e.id === resp.enquiry_id)

        return (
          <div key={resp.id} style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 10, padding: '18px 20px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: C.muted, fontFamily: '"DM Mono", monospace', marginBottom: 4 }}>
                  Enquiry: {enq?.quantity?.toLocaleString()} {enq?.unit} · {enq?.paper_type}
                </div>
                <div style={{ fontSize: 14, color: isDark ? C.text : '#1A1A1A', fontFamily: '"DM Mono", monospace' }}>
                  <span style={{ color: C.green, fontWeight: 600 }}>{resp.profiles?.name}</span> · {resp.location}
                </div>
                {resp.note && <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontFamily: '"DM Mono", monospace' }}>{resp.note}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ fontFamily: '"Playfair Display", serif', color: C.green, fontSize: 22 }}>₹{resp.price_per_kg}<span style={{ fontSize: 13 }}>/kg</span></div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => setEditResp(resp)} style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}33`, borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>Edit</button>
                  <button onClick={async () => {
                    if (!confirm('Delete this supplier response?')) return
                    await supabase.from('supplier_responses').delete().eq('id', resp.id)
                    refetch()
                  }} style={{ background: '#2A1010', color: C.red, border: `1px solid ${C.red}33`, borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>Delete</button>
                </div>
              </div>
            </div>

            <NegotiationPanel enquiry={enq} responses={[resp]} isDark={isDark} onStatusChange={refetch} />

            {!alreadyQuoted ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', paddingTop: 12, borderTop: `1px solid ${isDark ? C.border : '#E8E5E0'}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Your Price to Buyer (₹/kg)</div>
                  <input style={inp} type="number" min="1" placeholder={`e.g. ${resp.price_per_kg + 100}`} value={prices[resp.id] || ''} onChange={e => setPrices(p => ({ ...p, [resp.id]: e.target.value }))} />
                </div>
                <div style={{ flex: 2 }}>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Message to Buyer</div>
                  <input style={inp} placeholder="e.g. Available now, 3-day delivery" value={msgs[resp.id] || ''} onChange={e => setMsgs(m => ({ ...m, [resp.id]: e.target.value }))} />
                </div>
                <button disabled={sending === resp.id} onClick={() => handleSend(resp)} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 7, padding: '9px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {sending === resp.id ? 'Sending…' : 'Send Quote →'}
                </button>
              </div>
            ) : (
              <div style={{ paddingTop: 10, borderTop: `1px solid ${isDark ? C.border : '#E8E5E0'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: C.green+'15', color: C.green, border: `1px solid ${C.green}33`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>✓ Quote sent</span>
                <span style={{ fontSize: 12, color: C.muted, fontFamily: '"DM Mono", monospace' }}>@ ₹{sentQuote?.quoted_price}/kg</span>
              </div>
            )}
          </div>
        )
      })}

      {/* Edit Response Modal */}
      {editResp && (
        <EditModal
          title="Edit Supplier Response"
          isDark={isDark}
          data={{ price_per_kg: editResp.price_per_kg, location: editResp.location, note: editResp.note }}
          fields={[
            { key: 'price_per_kg', label: 'Price per kg (₹)', type: 'number', placeholder: 'e.g. 900' },
            { key: 'location',     label: 'Location',          placeholder: 'e.g. Mumbai' },
            { key: 'note',         label: 'Note',              placeholder: 'Optional note' },
          ]}
          onSave={async (form) => {
            await supabase.from('supplier_responses').update({ price_per_kg: parseFloat(form.price_per_kg), location: form.location, note: form.note }).eq('id', editResp.id)
            refetch()
          }}
          onClose={() => setEditResp(null)}
        />
      )}
    </div>
  )
}

// ── Quotes Sent ───────────────────────────────────────────────────────
function QuotesSent() {
  const { isDark } = useTheme()
  const { quotes, loading, refetch } = useQuotes({ role: 'admin' })
  const [editQuote, setEditQuote] = useState(null)

  return (
    <div style={{ padding: '28px 32px' }}>
      <SectionTitle title="Quotes to Buyers" subtitle="Admin · Sent" isDark={isDark} />
      {loading && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>Loading…</div>}
      {!loading && quotes.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>No quotes sent yet.</div>}

      {quotes.map(q => {
        const margin = q.quoted_price - q.supplier_price
        return (
          <div key={q.id} style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 10, padding: '18px 20px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 14, color: isDark ? C.text : '#1A1A1A', fontWeight: 600, fontFamily: '"Playfair Display", serif', marginBottom: 4 }}>
                  {q.enquiries?.quantity?.toLocaleString()} {q.enquiries?.unit} · {q.enquiries?.paper_type}
                </div>
                <div style={{ fontSize: 12, color: C.muted, fontFamily: '"DM Mono", monospace', marginBottom: 3 }}>
                  Sent to: <span style={{ color: '#6E9EC8' }}>{q.enquiries?.profiles?.name || 'Buyer'}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, fontFamily: '"DM Mono", monospace' }}>
                  Supplier @ ₹{q.supplier_price}/kg
                </div>
                {q.message && <div style={{ fontSize: 12, color: C.muted, fontFamily: '"DM Mono", monospace', marginTop: 4 }}>{q.message}</div>}
                
                <div style={{ fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace', marginTop: 6 }}>Sent {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <NegotiationPanel enquiry={q.enquiries} responses={[]} isDark={isDark} onStatusChange={refetch} />
        </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: '"Playfair Display", serif', color: C.accent, fontSize: 22 }}>₹{q.quoted_price}<span style={{ fontSize: 13 }}>/kg</span></div>
                <div style={{ fontSize: 11, color: C.green, marginTop: 2, fontFamily: '"DM Mono", monospace' }}>+₹{margin}/kg margin</div>
                <div style={{ display: 'flex', gap: 5, marginTop: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditQuote(q)} style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}33`, borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>Edit</button>
                  <button onClick={async () => {
                    if (!confirm('Delete this quote?')) return
                    await supabase.from('quotes').delete().eq('id', q.id)
                    refetch()
                  }} style={{ background: '#2A1010', color: C.red, border: `1px solid ${C.red}33`, borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Edit Quote Modal */}
      {editQuote && (
        <EditModal
          title="Edit Quote to Buyer"
          isDark={isDark}
          data={{ quoted_price: editQuote.quoted_price, message: editQuote.message }}
          fields={[
            { key: 'quoted_price', label: 'Quoted Price to Buyer (₹/kg)', type: 'number', placeholder: 'e.g. 1200' },
            { key: 'message',      label: 'Message to Buyer', placeholder: 'e.g. Available now' },
          ]}
          onSave={async (form) => {
            await supabase.from('quotes').update({ quoted_price: parseFloat(form.quoted_price), message: form.message }).eq('id', editQuote.id)
            refetch()
          }}
          onClose={() => setEditQuote(null)}
        />
      )}
    </div>
  )
}

// ── Admin New Enquiry ─────────────────────────────────────────────────
function AdminNewEnquiry({ setTab }) {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { createEnquiry } = useEnquiries({ role: 'admin', userId: user?.id })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (done) return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${C.green}44`, borderRadius: 10, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
        <div style={{ color: C.green, fontSize: 20, fontFamily: '"Playfair Display", serif' }}>Enquiry Submitted!</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <button onClick={() => setDone(false)} style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace' }}>New Enquiry</button>
          <button onClick={() => setTab('enquiries')} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>View All</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '28px 32px', maxWidth: 700 }}>
      <SectionTitle title="New Enquiry" subtitle="Admin · Post Enquiry" isDark={isDark} />
      <EnquiryForm onSubmit={async (form) => {
        setSubmitting(true)
        try { await createEnquiry(form); setDone(true) }
        catch (err) { alert(err.message) }
        finally { setSubmitting(false) }
      }} loading={submitting} />
    </div>
  )
}

// ── Main AdminPage ────────────────────────────────────────────────────
export default function AdminPage({ tab, setTab }) {
  if (tab === 'dashboard')  return <DashboardPage setTab={setTab} />
  if (tab === 'responses')  return <SupplierResponses />
  if (tab === 'quotes')     return <QuotesSent />
  if (tab === 'new')        return <AdminNewEnquiry setTab={setTab} />
  if (tab === 'master')     return <MasterPage />
  if (tab === 'users')      return <UserManagerPage />
  return <AllEnquiries setTab={setTab} />
}