import { StatusBadge } from './StatusBadge'
import { C } from '../lib/constants'
import { useTheme } from '../context/ThemeContext'

export function EnquiryCard({ enquiry, footer, responseCount, hideProfile }) {
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
          <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? C.text : '#1A1A1A', fontFamily: '"Playfair Display", serif' }}>
            {quantity?.toLocaleString()} {unit} · {paper_type}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Full details row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, margin: '10px 0', padding: '10px 0', borderTop: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderBottom: `1px solid ${isDark ? C.border : '#E8E5E0'}` }}>
        {[
          { label: 'Paper Type', value: paper_type },
          { label: 'GSM', value: `${gsm} GSM` },
          { label: 'Coating', value: coating },
          { label: 'Shade', value: shade },
          { label: 'Quantity', value: `${quantity?.toLocaleString()} ${unit}` },
          ...(!hideProfile ? [{ label: 'Buyer', value: profiles?.name || '—' }] : []),
          { label: 'Date', value: new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
          { label: 'Notes', value: notes || '—' },
        ].map(d => (
          <div key={d.label}>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>{d.label}</div>
            <div style={{ fontSize: 12, color: isDark ? C.text : '#1A1A1A', fontFamily: '"DM Mono", monospace' }}>{d.value}</div>
          </div>
        ))}
      </div>

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