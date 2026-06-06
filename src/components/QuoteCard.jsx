import { C } from '../lib/constants'

export function QuoteCard({ quote }) {
  const { quoted_price, supplier_price, message, created_at, enquiries, supplier_responses } = quote
  const margin = (quoted_price - supplier_price).toFixed(0)

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 14, color: C.text, marginBottom: 4 }}>
          {enquiries?.quantity} {enquiries?.unit} · {enquiries?.paper_type}
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 3 }}>
          Sent to: <span style={{ color: C.blue }}>{enquiries?.profiles?.name || 'Buyer'}</span>
        </div>
        <div style={{ fontSize: 12, color: C.muted }}>
          Supplier: {supplier_responses?.profiles?.name} @ ₹{supplier_price}/kg
        </div>
          {message && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{message}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: C.accent, fontSize: 22 }}>
            ₹{quoted_price}<span style={{ fontSize: 13 }}>/kg</span>
          </div>
          <div style={{ fontSize: 11, color: C.green }}>+₹{margin}/kg margin</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
        Sent {new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
    </div>
  )
}
