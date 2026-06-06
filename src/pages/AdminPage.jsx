import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useEnquiries } from '../hooks/useEnquiries'
import { useResponses, useQuotes } from '../hooks/useResponses'
import { EnquiryCard } from '../components/EnquiryCard'
import { EnquiryForm } from '../components/EnquiryForm'
import { ResponseCard } from '../components/ResponseCard'
import { QuoteCard } from '../components/QuoteCard'
import MasterPage from './MasterPage'
import UserManagerPage from './UserManagerPage'
import { C } from '../lib/constants'

const section = { padding: '32px 36px', maxWidth: 900 }

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
function AllEnquiries() {
  const { enquiries, loading } = useEnquiries({ role: 'admin' })
  const { responses } = useResponses({ role: 'admin' })

  return (
    <div style={section}>
      <SectionTitle title="All Enquiries" subtitle="Admin · Overview" />
      {loading && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>Loading…</div>}
      {!loading && enquiries.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>No enquiries yet.</div>}
      {enquiries.map((enq) => {
        const count = responses.filter((r) => r.enquiry_id === enq.id).length
        return (
          <EnquiryCard key={enq.id} enquiry={enq} footer={
            <span style={{ fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace' }}>
              {count} supplier response{count !== 1 ? 's' : ''}
            </span>
          } />
        )
      })}
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
  return <AllEnquiries />
}