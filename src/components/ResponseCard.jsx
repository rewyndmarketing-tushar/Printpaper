import { C } from '../lib/constants'

export function ResponseCard({ response, footer }) {
  const { price_per_kg, location, note, created_at, profiles, enquiries } = response

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>
            Enquiry: {enquiries?.quantity} {enquiries?.unit} · {enquiries?.paper_type}
          </div>
          <div style={{ fontSize: 14, color: C.text }}>
            <span style={{ color: C.green }}>{profiles?.name}</span>
            {' · '}{location}
          </div>
          {note && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{note}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: C.green, fontSize: 22 }}>
            ₹{price_per_kg}<span style={{ fontSize: 13 }}>/kg</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            {new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      </div>
      {footer && <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>{footer}</div>}
    </div>
  )
}
