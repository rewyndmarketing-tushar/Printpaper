import { StatusBadge } from './StatusBadge'
import { C } from '../lib/constants'

export function EnquiryCard({ enquiry, footer }) {
  const { paper_type, gsm, coating, shade, quantity, unit, notes, status, created_at, profiles } = enquiry

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 15, color: C.text, marginBottom: 4 }}>
            {quantity} {unit} · {paper_type}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {gsm} GSM · {coating} · {shade}
            {profiles?.name && <> · <span style={{ color: C.blue }}>{profiles.name}</span></>}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      {notes && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Note: {notes}</div>}
      <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
        {new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
      {footer && <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>{footer}</div>}
    </div>
  )
}
