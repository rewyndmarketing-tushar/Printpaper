import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useEnquiries } from '../hooks/useEnquiries'
import { useQuotes } from '../hooks/useResponses'
import { EnquiryCard } from '../components/EnquiryCard'
import { EnquiryForm } from '../components/EnquiryForm'
import { QuoteCard } from '../components/QuoteCard'
import { C } from '../lib/constants'

const section = { padding: '24px', maxWidth: 860, margin: '0 auto' }

export default function PurchaserPage({ tab, setTab }) {
  const { user } = useAuth()
  const { enquiries, loading, createEnquiry } = useEnquiries({ role: 'purchaser', userId: user?.id })
  const { quotes }  = useQuotes({ role: 'purchaser', userId: user?.id })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (form) => {
    setSubmitting(true)
    try {
      await createEnquiry(form)
      setDone(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (tab === 'new') {
    if (done) return (
      <div style={section}>
        <div style={{ background: C.card, border: `1px solid ${C.green}44`, borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
          <div style={{ color: C.green, fontSize: 20, fontFamily: "'DM Serif Display', Georgia, serif" }}>Enquiry Submitted!</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 8 }}>We'll send you a price quote soon.</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={() => { setDone(false) }} style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              New Enquiry
            </button>
            <button onClick={() => setTab('enquiries')} style={{ background: C.accent, color: '#0F0E0C', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>
              View My Enquiries
            </button>
          </div>
        </div>
      </div>
    )
    return (
      <div style={section}>
        <div style={{ color: C.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>New Paper Enquiry</div>
        <EnquiryForm onSubmit={handleSubmit} loading={submitting} />
      </div>
    )
  }

  // My Enquiries tab
  return (
    <div style={section}>
      <div style={{ color: C.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>My Enquiries</div>
      {loading && <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div>}
      {!loading && enquiries.length === 0 && (
        <div style={{ color: C.muted, fontSize: 13 }}>
          No enquiries yet.{' '}
          <button onClick={() => setTab('new')} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Create one →</button>
        </div>
      )}
      {enquiries.map((enq) => {
        const quote = quotes.find((q) => q.enquiry_id === enq.id)
        return (
          <EnquiryCard key={enq.id} enquiry={enq} footer={
            quote ? (
              <div style={{ background: C.green + '11', border: `1px solid ${C.green}33`, borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ color: C.green, fontSize: 11, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Quote Received</div>
                <div style={{ fontSize: 22, color: C.green, fontFamily: "'DM Serif Display', Georgia, serif" }}>₹{quote.quoted_price}/kg</div>
                {quote.message && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{quote.message}</div>}
              </div>
            ) : null
          } />
        )
      })}
    </div>
  )
}
