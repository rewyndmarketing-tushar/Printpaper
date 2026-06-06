import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { useEnquiries } from '../hooks/useEnquiries'
import { useQuotes } from '../hooks/useResponses'
import { useOrders } from '../hooks/useOrders'
import { EnquiryForm } from '../components/EnquiryForm'
import { NegotiationPanel } from '../components/NegotiationPanel'
import { C } from '../lib/constants'

const statusColor = { open: '#6E9EC8', responded: '#C8A96E', quoted: '#6EC89E', closed: '#666' }
const orderStatusColor = { confirmed: '#6E9EC8', processing: '#C8A96E', delivered: '#6EC89E', cancelled: '#C86E6E' }

export default function PurchaserPage({ tab, setTab }) {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { enquiries, loading, createEnquiry } = useEnquiries({ role: 'purchaser', userId: user?.id })
  const { quotes } = useQuotes({ role: 'purchaser', userId: user?.id })
  const { orders, loading: oLoading, createOrder } = useOrders({ role: 'purchaser', userId: user?.id })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [accepting, setAccepting] = useState(null)

  const th = { fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left', borderBottom: `1px solid ${isDark ? C.border : '#E8E5E0'}`, background: isDark ? C.card : '#F5F3EF', whiteSpace: 'nowrap' }
  const td = { fontSize: 12.5, color: isDark ? C.text : '#1A1A1A', fontFamily: '"DM Mono", monospace', padding: '11px 16px', borderBottom: `1px solid ${isDark ? C.border : '#F0EDE8'}`, verticalAlign: 'middle' }

  const handleAcceptOrder = async (enquiry, quote) => {
    setAccepting(quote.id)
    try {
      await createOrder({ enquiryId: enquiry.id, quoteId: quote.id, purchaserId: user?.id })
      setTab('orders')
    } catch (err) {
      alert(err.message)
    } finally {
      setAccepting(null)
    }
  }

  // ── New Enquiry ──────────────────────────────────────────────────────
  if (tab === 'new') {
    if (done) return (
      <div style={{ padding: '28px 32px' }}>
        <div style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${C.green}44`, borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
          <div style={{ color: C.green, fontSize: 20, fontFamily: '"Playfair Display", serif' }}>Enquiry Submitted!</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 8, fontFamily: '"DM Mono", monospace' }}>We'll send you a price quote soon.</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={() => setDone(false)} style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace' }}>New Enquiry</button>
            <button onClick={() => setTab('enquiries')} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>View My Enquiries</button>
          </div>
        </div>
      </div>
    )
    return (
      <div style={{ padding: '28px 32px', maxWidth: 700 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Buyer · Request</div>
          <div style={{ fontSize: 22, fontFamily: '"Playfair Display", serif', color: isDark ? C.text : '#1A1A1A', fontWeight: 700 }}>New Enquiry</div>
        </div>
        <EnquiryForm onSubmit={async (form) => {
          setSubmitting(true)
          try { await createEnquiry(form); setDone(true) }
          catch (err) { alert(err.message) }
          finally { setSubmitting(false) }
        }} loading={submitting} />
      </div>
    )
  }

  // ── My Orders (History) ──────────────────────────────────────────────
  if (tab === 'orders') return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Buyer · History</div>
        <div style={{ fontSize: 22, fontFamily: '"Playfair Display", serif', color: isDark ? C.text : '#1A1A1A', fontWeight: 700 }}>My Orders</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Orders',   value: orders.length,                                              color: C.accent },
          { label: 'Confirmed',      value: orders.filter(o => o.status === 'confirmed').length,        color: C.blue },
          { label: 'Processing',     value: orders.filter(o => o.status === 'processing').length,       color: C.amber },
          { label: 'Delivered',      value: orders.filter(o => o.status === 'delivered').length,        color: C.green },
        ].map(s => (
          <div key={s.label} style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 10, padding: '14px 18px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: '"Playfair Display", serif' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['#', 'Order Date', 'Paper Type', 'GSM', 'Qty', 'Rate', 'Total Value', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {oLoading && <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: C.muted }}>Loading…</td></tr>}
            {!oLoading && orders.length === 0 && (
              <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: C.muted }}>
                No orders yet.{' '}
                <span onClick={() => setTab('enquiries')} style={{ color: C.accent, cursor: 'pointer' }}>View your enquiries →</span>
              </td></tr>
            )}
            {orders.map((o, i) => {
              const sc = orderStatusColor[o.status] || '#666'
              const totalValue = o.quotes?.quoted_price && o.enquiries?.quantity
                ? (o.quotes.quoted_price * o.enquiries.quantity).toLocaleString()
                : '—'
              return (
                <tr key={o.id}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? '#161616' : '#FAFAF8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  <td style={{ ...td, color: C.muted, fontSize: 11 }}>{String(i+1).padStart(2,'0')}</td>
                  <td style={{ ...td, color: C.muted, fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{o.enquiries?.paper_type || '—'}</td>
                  <td style={{ ...td, color: C.muted }}>{o.enquiries?.gsm} GSM</td>
                  <td style={td}>{o.enquiries?.quantity?.toLocaleString()} {o.enquiries?.unit}</td>
                  <td style={td}><span style={{ color: C.accent, fontWeight: 600 }}>₹{o.quotes?.quoted_price}/kg</span></td>
                  <td style={td}><span style={{ color: C.green, fontWeight: 600 }}>₹{totalValue}</span></td>
                  <td style={td}>
                    <span style={{ background: sc + '18', color: sc, border: `1px solid ${sc}33`, borderRadius: 4, padding: '3px 10px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace' }}>Showing {orders.length} orders</div>
    </div>
  )

  // ── My Enquiries ─────────────────────────────────────────────────────
  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Buyer · Overview</div>
          <div style={{ fontSize: 22, fontFamily: '"Playfair Display", serif', color: isDark ? C.text : '#1A1A1A', fontWeight: 700 }}>My Enquiries</div>
        </div>
        <button onClick={() => setTab('new')} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 7, padding: '9px 18px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700, boxShadow: '0 4px 12px #C8A96E33' }}>
          + New Enquiry
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Enquiries', value: enquiries.length,                                    color: C.accent },
          { label: 'Open',            value: enquiries.filter(e => e.status === 'open').length,   color: C.blue },
          { label: 'Quoted',          value: enquiries.filter(e => e.status === 'quoted').length, color: C.green },
          { label: 'Orders Placed',   value: orders.length,                                        color: '#C86E9E' },
        ].map(s => (
          <div key={s.label} onClick={() => s.label === 'Orders Placed' && setTab('orders')}
            style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 10, padding: '14px 18px', borderTop: `3px solid ${s.color}`, cursor: s.label === 'Orders Placed' ? 'pointer' : 'default' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: '"Playfair Display", serif' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Enquiries Table */}
      <div style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['#', 'Date', 'Paper Type', 'GSM', 'Coating', 'Shade', 'Qty', 'Status', 'Quote', 'Action'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={10} style={{ ...td, textAlign: 'center', color: C.muted }}>Loading…</td></tr>}
            {!loading && enquiries.length === 0 && (
              <tr><td colSpan={10} style={{ ...td, textAlign: 'center', color: C.muted }}>
                No enquiries yet.{' '}
                <span onClick={() => setTab('new')} style={{ color: C.accent, cursor: 'pointer' }}>Create one →</span>
              </td></tr>
            )}
            {enquiries.map((e, i) => {
              const quote = quotes.find(q => q.enquiry_id === e.id)
              const alreadyOrdered = orders.some(o => o.enquiry_id === e.id)
              const sc = statusColor[e.status] || '#666'
              return (
                <tr key={e.id}
                  onMouseEnter={ev => ev.currentTarget.style.background = isDark ? '#161616' : '#FAFAF8'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  <td style={{ ...td, color: C.muted, fontSize: 11 }}>{String(i+1).padStart(2,'0')}</td>
                  <td style={{ ...td, color: C.muted, fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{e.paper_type}</td>
                  <td style={{ ...td, color: C.muted }}>{e.gsm}</td>
                  <td style={{ ...td, color: C.muted }}>{e.coating}</td>
                  <td style={{ ...td, color: C.muted }}>{e.shade}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{e.quantity?.toLocaleString()} {e.unit}</td>
                  <td style={td}>
                    <span style={{ background: sc + '18', color: sc, border: `1px solid ${sc}33`, borderRadius: 4, padding: '2px 8px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {e.status}
                    </span>
                  </td>
                  <td style={td}>
                    {quote
                      ? <span style={{ color: C.green, fontWeight: 700 }}>₹{quote.quoted_price}/kg</span>
                      : <span style={{ color: C.muted }}>Pending</span>
                    }
                  </td>
                  <td style={td}>
                    {quote && !alreadyOrdered ? (
                      <button
                        disabled={accepting === quote.id}
                        onClick={() => handleAcceptOrder(e, quote)}
                        style={{ background: 'linear-gradient(135deg, #6EC89E, #4A9E7E)', color: '#0A0A0A', border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}
                      >
                        {accepting === quote.id ? 'Placing…' : '✓ Accept'}
                      </button>
                    ) : alreadyOrdered ? (
                      <span style={{ color: C.green, fontSize: 11, fontFamily: '"DM Mono", monospace' }}>✓ Ordered</span>
                    ) : (
                      <span style={{ color: C.muted, fontSize: 11 }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace' }}>Showing {enquiries.length} enquiries</div>

      {/* Negotiation panels for quoted/responded enquiries */}
      {enquiries.filter(e => e.status === 'quoted' || e.status === 'responded').map(e => (
        <div key={`neg-${e.id}`} style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace', marginBottom: 4, padding: '0 4px' }}>
            ◈ Negotiation — <span style={{ color: isDark ? C.text : '#1A1A1A' }}>{e.paper_type} · {e.quantity?.toLocaleString()} {e.unit}</span>
          </div>
          <NegotiationPanel enquiry={e} responses={[]} isDark={isDark} />
        </div>
      ))}
    </div>
  )
}