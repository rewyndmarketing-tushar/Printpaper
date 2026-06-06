import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { useEnquiries } from '../hooks/useEnquiries'
import { useResponses, useQuotes } from '../hooks/useResponses'
import { EnquiryCard } from '../components/EnquiryCard'
import { EnquiryForm } from '../components/EnquiryForm'
import { ResponseCard } from '../components/ResponseCard'
import { QuoteCard } from '../components/QuoteCard'
import MasterPage from './MasterPage'
import UserManagerPage from './UserManagerPage'
import { C } from '../lib/constants'

const section = { padding: '28px 32px', minHeight: '100vh' }

const SectionTitle = ({ title, subtitle }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 11, color: C.muted2, fontFamily: '"DM Mono", monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
      {subtitle || 'PaperLink'}
    </div>
    <div style={{ fontSize: 22, fontFamily: '"Playfair Display", Georgia, serif', color: C.text, fontWeight: 700 }}>
      {title}
    </div>
  </div>
)

// ── All Enquiries ─────────────────────────────────────────────────────
function AllEnquiries({ setTab }) {
  const { isDark } = useTheme()
  const { enquiries, loading } = useEnquiries({ role: 'admin' })
  const { responses } = useResponses({ role: 'admin' })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = enquiries.filter(e => {
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    const matchSearch = search.trim() === '' ||
      e.paper_type?.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.name?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const stats = [
    { label: 'Open',      value: enquiries.filter(e => e.status === 'open').length,      color: '#6E9EC8' },
    { label: 'Responded', value: enquiries.filter(e => e.status === 'responded').length,  color: '#C8A96E' },
    { label: 'Quoted',    value: enquiries.filter(e => e.status === 'quoted').length,     color: '#6EC89E' },
    { label: 'Total',     value: enquiries.length,                                         color: isDark ? C.text : '#1A1A1A' },
  ]

  const th = { fontSize: 10.5, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', padding: '10px 14px', textAlign: 'left', borderBottom: `1px solid ${isDark ? C.border : '#E8E5E0'}`, background: isDark ? C.card : '#F5F3EF', whiteSpace: 'nowrap' }
  const td = { fontSize: 12.5, color: isDark ? C.text : '#1A1A1A', fontFamily: '"DM Mono", monospace', padding: '12px 14px', borderBottom: `1px solid ${isDark ? C.border : '#F0EDE8'}`, verticalAlign: 'middle' }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Admin · Overview</div>
          <div style={{ fontSize: 22, fontFamily: '"Playfair Display", Georgia, serif', color: isDark ? C.text : '#1A1A1A', fontWeight: 700 }}>All Enquiries</div>
        </div>
        <button onClick={() => setTab('new')} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 7, padding: '9px 18px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700, boxShadow: '0 4px 12px #C8A96E33' }}>
          + New Enquiry
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} onClick={() => setFilterStatus(s.label.toLowerCase() === 'total' ? 'all' : s.label.toLowerCase())}
            style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${filterStatus === (s.label.toLowerCase() === 'total' ? 'all' : s.label.toLowerCase()) ? s.color + '66' : isDark ? C.border : '#E8E5E0'}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: '"Playfair Display", serif' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
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
            <tr>
              {['#', 'Date', 'Buyer', 'Paper Type', 'GSM', 'Coating', 'Shade', 'Qty', 'Responses', 'Status', 'Action'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={11} style={{ ...td, textAlign: 'center', color: C.muted }}>Loading…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={11} style={{ ...td, textAlign: 'center', color: C.muted }}>No enquiries found</td></tr>
            )}
            {filtered.map((e, i) => {
              const count = responses.filter(r => r.enquiry_id === e.id).length
              const statusColor = { open: '#6E9EC8', responded: '#C8A96E', quoted: '#6EC89E', closed: '#666' }[e.status] || '#666'
              return (
                <tr key={e.id}
                  onMouseEnter={ev => ev.currentTarget.style.background = isDark ? '#161616' : '#FAFAF8'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  <td style={{ ...td, color: C.muted, fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</td>
                  <td style={{ ...td, color: C.muted, fontSize: 11, whiteSpace: 'nowrap' }}>
                    {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ ...td, color: C.blue, fontWeight: 500 }}>{e.profiles?.name || '—'}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{e.paper_type}</td>
                  <td style={{ ...td, color: C.muted }}>{e.gsm}</td>
                  <td style={{ ...td, color: C.muted }}>{e.coating}</td>
                  <td style={{ ...td, color: C.muted }}>{e.shade}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{e.quantity?.toLocaleString()} {e.unit}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <span style={{ background: count > 0 ? C.green + '22' : C.muted + '22', color: count > 0 ? C.green : C.muted, borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>{count}</span>
                  </td>
                  <td style={td}>
                    <span style={{ background: statusColor + '18', color: statusColor, border: `1px solid ${statusColor}33`, borderRadius: 4, padding: '3px 8px', fontSize: 10, fontFamily: '"DM Mono", monospace', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      {e.status}
                    </span>
                  </td>
                  <td style={td}>
                    <button onClick={() => setTab('responses')} style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}33`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>
                      View
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Count */}
      <div style={{ marginTop: 10, fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace' }}>
        Showing {filtered.length} of {enquiries.length} enquiries
      </div>
    </div>
  )
}

// ── Supplier Responses ────────────────────────────────────────────────
function SupplierResponses() {
  const { responses, loading } = useResponses({ role: 'admin' })
  const { quotes, sendQuote }  = useQuotes({ role: 'admin' })
  const { enquiries }          = useEnquiries({ role: 'admin' })
  const [prices, setPrices]    = useState({})
  const [msgs, setMsgs]        = useState({})
  const [sending, setSending]  = useState(null)

  const inp = {
    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
    padding: '8px 12px', color: C.text, fontSize: 12,
    fontFamily: '"DM Mono", monospace', outline: 'none', width: '100%',
  }

  const handleSend = async (resp) => {
    const price = prices[resp.id]
    if (!price) return
    const enq = enquiries.find((e) => e.id === resp.enquiry_id)
    setSending(resp.id)
    try {
      await sendQuote({
        enquiryId: resp.enquiry_id, purchaserId: enq?.purchaser_id,
        responseId: resp.id, supplierPrice: resp.price_per_kg,
        quotedPrice: parseFloat(price), message: msgs[resp.id] || '',
      })
    } catch (err) { alert(err.message) }
    finally { setSending(null) }
  }

  return (
    <div style={section}>
      <SectionTitle title="Supplier Responses" subtitle="Admin · Private" />
      <div style={{ background: '#1A1200', border: '1px solid #C8A96E22', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#C8A96E99', fontFamily: '"DM Mono", monospace' }}>
        🔒 Prices are private — only you see these
      </div>
      {loading && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>Loading…</div>}
      {!loading && responses.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>No supplier responses yet.</div>}
      {responses.map((resp) => {
        const alreadyQuoted = quotes.some((q) => q.supplier_response_id === resp.id)
        const sentQuote = quotes.find((q) => q.supplier_response_id === resp.id)
        return (
          <ResponseCard key={resp.id} response={resp} footer={
            alreadyQuoted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: C.green + '15', color: C.green, border: `1px solid ${C.green}33`, borderRadius: 4, padding: '3px 10px', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>
                  ✓ Quote sent
                </span>
                <span style={{ fontSize: 12, color: C.muted, fontFamily: '"DM Mono", monospace' }}>₹{sentQuote?.quoted_price}/kg</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Your Price to Buyer (₹/kg)</div>
                  <input style={inp} type="number" min="1"
                    placeholder={`e.g. ${resp.price_per_kg + 100}`}
                    value={prices[resp.id] || ''}
                    onChange={(e) => setPrices((p) => ({ ...p, [resp.id]: e.target.value }))} />
                </div>
                <div style={{ flex: 2, minWidth: 160 }}>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Message to Buyer</div>
                  <input style={inp} placeholder="e.g. Available now, 3-day delivery"
                    value={msgs[resp.id] || ''}
                    onChange={(e) => setMsgs((m) => ({ ...m, [resp.id]: e.target.value }))} />
                </div>
                <button disabled={sending === resp.id} onClick={() => handleSend(resp)} style={{
                  background: 'linear-gradient(135deg, #C8A96E, #A8893E)',
                  color: '#0A0A0A', border: 'none', borderRadius: 7,
                  padding: '9px 18px', cursor: 'pointer', fontSize: 12,
                  fontFamily: '"DM Mono", monospace', fontWeight: 700,
                  whiteSpace: 'nowrap', boxShadow: '0 4px 12px #C8A96E33',
                }}>
                  {sending === resp.id ? 'Sending…' : 'Send Quote →'}
                </button>
              </div>
            )
          } />
        )
      })}
    </div>
  )
}

// ── Quotes Sent ───────────────────────────────────────────────────────
function QuotesSent() {
  const { quotes, loading } = useQuotes({ role: 'admin' })
  return (
    <div style={section}>
      <SectionTitle title="Quotes to Buyers" subtitle="Admin · Sent" />
      {loading && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>Loading…</div>}
      {!loading && quotes.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>No quotes sent yet.</div>}
      {quotes.map((q) => <QuoteCard key={q.id} quote={q} />)}
    </div>
  )
}

// ── Admin New Enquiry ─────────────────────────────────────────────────
function AdminNewEnquiry({ setTab }) {
  const { user } = useAuth()
  const { createEnquiry } = useEnquiries({ role: 'admin', userId: user?.id })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (form) => {
    setSubmitting(true)
    try {
      await createEnquiry(form)
      setDone(true)
    } catch (err) { alert(err.message) }
    finally { setSubmitting(false) }
  }

  if (done) return (
    <div style={section}>
      <div style={{ background: C.surface, border: `1px solid ${C.green}44`, borderRadius: 10, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
        <div style={{ color: C.green, fontSize: 20, fontFamily: '"Playfair Display", serif' }}>Enquiry Submitted!</div>
        <div style={{ color: C.muted, fontSize: 13, marginTop: 8, fontFamily: '"DM Mono", monospace' }}>Suppliers will respond shortly.</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <button onClick={() => setDone(false)} style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace' }}>
            New Enquiry
          </button>
          <button onClick={() => setTab('enquiries')} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
            View All Enquiries
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={section}>
      <SectionTitle title="New Enquiry" subtitle="Admin · Post Enquiry" />
      <EnquiryForm onSubmit={handleSubmit} loading={submitting} />
    </div>
  )
}

// ── Main AdminPage ────────────────────────────────────────────────────
export default function AdminPage({ tab, setTab }) {
  if (tab === 'responses') return <SupplierResponses />
  if (tab === 'quotes')    return <QuotesSent />
  if (tab === 'new')       return <AdminNewEnquiry setTab={setTab} />
  if (tab === 'master')    return <MasterPage />
  if (tab === 'users')     return <UserManagerPage />
  return <AllEnquiries setTab={setTab} />
}