import { C } from '../lib/constants'

const STATUS_COLOR = {
  open:      C.blue,
  responded: C.accent,
  quoted:    C.green,
  closed:    C.muted,
}

export function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || C.muted
  return (
    <span style={{ background: color + '22', color, border: `1px solid ${color}44`, borderRadius: 4, padding: '2px 8px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
      {status}
    </span>
  )
}
