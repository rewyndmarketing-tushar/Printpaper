import { useAuth } from '../hooks/useAuth'
import { C } from '../lib/constants'

const roleColor = (r) => ({ admin: C.accent, purchaser: C.blue, supplier: C.green })[r] || C.muted

export function Navbar({ tab, setTab }) {
  const { profile, signOut } = useAuth()
  if (!profile) return null

  const tabs = {
    admin:     [['enquiries', 'All Enquiries'], ['responses', 'Supplier Responses'], ['quotes', 'Quotes to Buyers']],
    purchaser: [['enquiries', 'My Enquiries'], ['new', 'New Enquiry']],
    supplier:  [['enquiries', 'Browse Enquiries'], ['responses', 'My Responses']],
  }[profile.role] || []

  return (
    <nav style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: C.accent, letterSpacing: 1 }}>
          PaperLink
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: tab === key ? C.accent + '22' : 'transparent',
              color: tab === key ? C.accent : C.muted,
              border: `1px solid ${tab === key ? C.accent + '44' : 'transparent'}`,
              borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ background: roleColor(profile.role) + '22', color: roleColor(profile.role), border: `1px solid ${roleColor(profile.role)}44`, borderRadius: 4, padding: '2px 8px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
          {profile.role}
        </span>
        <span style={{ fontSize: 13, color: C.muted }}>{profile.name}</span>
        <button onClick={signOut} style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
          Logout
        </button>
      </div>
    </nav>
  )
}
