import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { useEnquiries } from '../hooks/useEnquiries'
import { useQuotes } from '../hooks/useResponses'
import { EnquiryForm } from '../components/EnquiryForm'
import { C } from '../lib/constants'

export default function PurchaserPage({ tab, setTab }) {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { enquiries, loading, createEnquiry } = useEnquiries({ role: 'purchaser', userId: user?.id })
  const { quotes } = useQuotes({ role: 'purchaser', userId: user?.id })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const th = { fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left', borderBottom: `1px solid ${isDark ? C.border : '#E8E5E0'}`, background: isDark ? C.card : '#F5F3EF', whiteSpace: 'nowrap' }
  const td = { fontSize: 12.5, color: isDark ? C.text : '#1A1A1A', fontFamily: '"DM Mono", monospace', padding: '11px 16px', borderBottom: `1px solid ${isDark ? C.border : '#F0EDE8'}`, verticalAlign: 'middle' }

  // ── New Enquiry tab ──────────────────────────────────────────────────
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

  // ── My Enquiries tab ─────────────────────────────────────────────────
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
          { label: 'Quotes Received', value: quotes.length,                                        color: '#C86E9E' },
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
            <tr>{['#', 'Date', 'Paper Type', 'GSM', 'Coating', 'Shade', 'Qty', 'Status', 'Quote'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: C.muted }}>Loading…</td></tr>}
            {!loading && enquiries.length === 0 && (
              <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: C.muted }}>
                No enquiries yet.{' '}
                <span onClick={() => setTab('new')} style={{ color: C.accent, cursor: 'pointer' }}>Create one →</span>
              </td></tr>
            )}
            {enquiries.map((e, i) => {
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
                      ? <span style={{ color: C.green, fontWeight: 700, fontFamily: '"DM Mono", monospace' }}>₹{quote.quoted_price}/kg</span>
                      : <span style={{ color: C.muted }}>Pending</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace' }}>Showing {enquiries.length} enquiries</div>
    </div>
  )
}