import { StatusBadge } from './StatusBadge'
import { C } from '../lib/constants'
import { useTheme } from '../context/ThemeContext'

export function EnquiryCard({ enquiry, footer, responseCount }) {
  const { isDark } = useTheme()
  const { paper_type, gsm, coating, shade, quantity, unit, notes, status, created_at, profiles } = enquiry

  return (
    <div style={{
      background: isDark ? C.surface : '#FFFFFF',
      border: `1px solid ${isDark ? C.border : '#E8E5E0'}`,
      borderRadius: 10,
      padding: '16px 20px',
      marginBottom: 10,
      borderLeft: `3px solid ${
        enquiry.status === 'open' ? '#6E9EC8' :
        enquiry.status === 'responded' ? '#C8A96E' :
        enquiry.status === 'quoted' ? '#6EC89E' : '#444'
      }`,
      transition: 'all 0.2s',
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
          background: isDark ? C.bg : '#F5F3EF',
          border: `1px solid ${isDark ? C.border : '#E0DDD8'}`,
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

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: footer ? 14 : 0 }}>
        <span style={{ fontSize: 11, color: C.muted2, fontFamily: '"DM Mono", monospace' }}>
          {new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        {responseCount !== undefined && (
          <span style={{ fontSize: 11, color: C.muted2, fontFamily: '"DM Mono", monospace' }}>
            {responseCount} response{responseCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {footer && (
        <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          {footer}
        </div>
      )}
    </div>
  )
}