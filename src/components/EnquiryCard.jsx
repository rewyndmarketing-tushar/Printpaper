import { StatusBadge } from './StatusBadge'
import { C } from '../lib/constants'

export function EnquiryCard({ enquiry, footer }) {
  const { paper_type, gsm, coating, shade, quantity, unit, notes, status, created_at, profiles } = enquiry

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: '20px 24px',
      marginBottom: 12,
      transition: 'border-color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#2A2A2A'}
    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 5, fontFamily: '"Playfair Display", serif' }}>
            {quantity.toLocaleString()} {unit} · {paper_type}
          </div>
          <div style={{ fontSize: 12, color: C.muted, fontFamily: '"DM Mono", monospace', display: 'flex', gap: 12 }}>
            <span>{gsm} GSM</span>
            <span style={{ color: C.border2 }}>|</span>
            <span>{coating}</span>
            <span style={{ color: C.border2 }}>|</span>
            <span>{shade}</span>
            {profiles?.name && <>
              <span style={{ color: C.border2 }}>|</span>
              <span style={{ color: C.blue }}>{profiles.name}</span>
            </>}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {notes && (
        <div style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 12,
          color: C.muted,
          fontFamily: '"DM Mono", monospace',
          marginBottom: 10,
        }}>
          📝 {notes}
        </div>
      )}

      <div style={{ fontSize: 11, color: C.muted2, fontFamily: '"DM Mono", monospace', marginBottom: footer ? 14 : 0 }}>
        {new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>

      {footer && (
        <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          {footer}
        </div>
      )}
    </div>
  )
}