import { useState } from 'react'
import { useEnquiries } from '../hooks/useEnquiries'
import { useResponses, useQuotes } from '../hooks/useResponses'
import { EnquiryCard } from '../components/EnquiryCard'
import { ResponseCard } from '../components/ResponseCard'
import { QuoteCard } from '../components/QuoteCard'
import { C } from '../lib/constants'

const section = { padding: '24px', maxWidth: 900, margin: '0 auto' }
const inp = { background: '#0F0E0C', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', width: '100%' }
const lbl = { fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5, display: 'block' }

// ─── Sub-view: All Enquiries ─────────────────────────────────────────
function AllEnquiries() {
  const { enquiries, loading } = useEnquiries({ role: 'admin' })
  const { responses } = useResponses({ role: 'admin' })

  return (
    <div style={section}>
      <div style={{ color: C.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>All Enquiries</div>
      {loading && <div style={{ color: C.muted }}>Loading…</div>}
      {!loading && enquiries.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>No enquiries yet.</div>}
      {enquiries.map((enq) => {
        const count = responses.filter((r) => r.enquiry_id === enq.id).length
        return (
          <EnquiryCard key={enq.id} enquiry={enq} footer={
            <span style={{ fontSize: 12, color: C.muted }}>{count} supplier response{count !== 1 ? 's' : ''}</span>
          } />
        )
      })}
    </div>
  )
}

// ─── Sub-view: Supplier Responses + Send Quote ───────────────────────
function SupplierResponses() {
  const { responses, loading } = useResponses({ role: 'admin' })
  const { quotes, sendQuote }  = useQuotes({ role: 'admin' })
  const { enquiries }          = useEnquiries({ role: 'admin' })
  const [prices, setPrices]    = useState({})
  const [msgs, setMsgs]        = useState({})
  const [sending, setSending]  = useState(null)

  const handleSend = async (resp) => {
    const price = prices[resp.id]
    if (!price) return
    const enq = enquiries.find((e) => e.id === resp.enquiry_id)
    setSending(resp.id)
    try {
      await sendQuote({
        enquiryId:     resp.enquiry_id,
        purchaserId:   enq?.purchaser_id,
        responseId:    resp.id,
        supplierPrice: resp.price_per_kg,
        quotedPrice:   parseFloat(price),
        message:       msgs[resp.id] || '',
      })
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(null)
    }
  }

  return (
    <div style={section}>
      <div style={{ color: C.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Supplier Responses</div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Prices are private — only you see these.</div>
      {loading && <div style={{ color: C.muted }}>Loading…</div>}
      {!loading && responses.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>No supplier responses yet.</div>}
      {responses.map((resp) => {
        const alreadyQuoted = quotes.some((q) => q.supplier_response_id === resp.id)
        const sentQuote     = quotes.find((q) => q.supplier_response_id === resp.id)

        return (
          <ResponseCard key={resp.id} response={resp} footer={
            alreadyQuoted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: C.green + '22', color: C.green, border: `1px solid ${C.green}44`, borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>Quote sent to buyer</span>
                <span style={{ fontSize: 12, color: C.muted }}>@ ₹{sentQuote?.quoted_price}/kg</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={lbl}>Your Price to Buyer (₹/kg)</label>
                  <input style={inp} type="number" min="1"
                    placeholder={`e.g. ${resp.price_per_kg + 100}`}
                    value={prices[resp.id] || ''}
                    onChange={(e) => setPrices((p) => ({ ...p, [resp.id]: e.target.value }))}
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={lbl}>Message to Buyer (optional)</label>
                  <input style={inp}
                    placeholder="e.g. Available now, 3-day delivery"
                    value={msgs[resp.id] || ''}
                    onChange={(e) => setMsgs((m) => ({ ...m, [resp.id]: e.target.value }))}
                  />
                </div>
                <button
                  disabled={sending === resp.id}
                  onClick={() => handleSend(resp)}
                  style={{ background: C.accent, color: '#0F0E0C', border: 'none', borderRadius: 6, padding: '9px 16px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, whiteSpace: 'nowrap' }}
                >
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

// ─── Sub-view: Quotes Sent ───────────────────────────────────────────
function QuotesSent() {
  const { quotes, loading } = useQuotes({ role: 'admin' })
  return (
    <div style={section}>
      <div style={{ color: C.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>Quotes Sent to Buyers</div>
      {loading && <div style={{ color: C.muted }}>Loading…</div>}
      {!loading && quotes.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>No quotes sent yet.</div>}
      {quotes.map((q) => <QuoteCard key={q.id} quote={q} />)}
    </div>
  )
}

export default function AdminPage({ tab }) {
  if (tab === 'responses') return <SupplierResponses />
  if (tab === 'quotes')    return <QuotesSent />
  return <AllEnquiries />
}
