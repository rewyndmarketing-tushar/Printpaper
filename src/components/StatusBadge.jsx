import { C } from '../lib/constants'

const STATUS = {
  open:      { color: C.blue,   label: 'Open' },
  responded: { color: C.amber,  label: 'Responded' },
  quoted:    { color: C.green,  label: 'Quoted' },
  closed:    { color: C.muted,  label: 'Closed' },
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.open
  return (
    <span style={{
      background: s.color + '15',
      color: s.color,
      border: `1px solid ${s.color}33`,
      borderRadius: 4,
      padding: '3px 10px',
      fontSize: 10.5,
      fontFamily: '"DM Mono", monospace',
      letterSpacing: 1,
      textTransform: 'uppercase',
      fontWeight: 500,
    }}>
      {s.label}
    </span>
  )
}