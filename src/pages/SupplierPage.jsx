import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useEnquiries } from '../hooks/useEnquiries'
import { useResponses } from '../hooks/useResponses'
import { EnquiryCard } from '../components/EnquiryCard'
import { ResponseCard } from '../components/ResponseCard'
import { C } from '../lib/constants'

const section = { padding: '24px', maxWidth: 860, margin: '0 auto' }
const inp = { background: '#0F0E0C', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', width: '100%' }
const lbl = { fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5, display: 'block' }

function ResponseForm({ onSubmit, onCancel, loading }) {
  const [price, setPrice]       = useState('')
  const [location, setLocation] = useState('')
  const [note, setNote]         = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!price || !location) return
    onSubmit({ pricePerKg: parseFloat(price), location, note })
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div><label style={lbl}>Your Price (₹/kg)</label><input style={inp} type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 900" required /></div>
        <div><label style={lbl}>Your Location</label><input style={inp} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Andheri, Mumbai" required /></div>
        <div><label style={lbl}>Notes</label><input style={inp} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Delivery time, stock…" /></div>
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
  const { enquiries, loading: eLoading } = useEnquiries({ role: 'supplier' })
  const { responses, loading: rLoading, createResponse } = useResponses({ role: 'supplier', userId: user?.id })
  const [responding, setResponding] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const myReplied = new Set(responses.map((r) => r.enquiry_id))

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

  if (tab === 'responses') return (
    <div style={section}>
      <div style={{ color: C.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>My Responses</div>
      {rLoading && <div style={{ color: C.muted }}>Loading…</div>}
      {!rLoading && responses.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>You haven't responded to any enquiries yet.</div>}
      {responses.map((r) => <ResponseCard key={r.id} response={r} />)}
    </div>
  )

  const open = enquiries.filter((e) => e.status === 'open' || e.status === 'responded')

  return (
    <div style={section}>
      <div style={{ color: C.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>Open Enquiries</div>
      {eLoading && <div style={{ color: C.muted }}>Loading…</div>}
      {!eLoading && open.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>No open enquiries at the moment.</div>}
      {open.map((enq) => {
        const replied = myReplied.has(enq.id)
        return (
          <EnquiryCard key={enq.id} enquiry={enq} footer={
            replied ? (
              <span style={{ background: C.green + '22', color: C.green, border: `1px solid ${C.green}44`, borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>
                Responded ✓
              </span>
            ) : responding === enq.id ? (
              <ResponseForm
                onSubmit={(form) => handleRespond(enq.id, form)}
                onCancel={() => setResponding(null)}
                loading={submitting}
              />
            ) : (
              <button onClick={() => setResponding(enq.id)} style={{ background: C.accent, color: '#0F0E0C', border: 'none', borderRadius: 5, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600 }}>
                Respond with Price
              </button>
            )
          } />
        )
      })}
    </div>
  )
}
