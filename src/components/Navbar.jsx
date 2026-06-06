import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'

const roleConfig = {
  admin:     { color: '#C8A96E', bg: '#2A1F0E', label: 'Admin' },
  purchaser: { color: '#6E9EC8', bg: '#0E1E2A', label: 'Buyer' },
  supplier:  { color: '#6EC89E', bg: '#0E2A1E', label: 'Supplier' },
}

const tabs = {
  admin:     [['enquiries', '≡ All Enquiries'], ['responses', '◈ Supplier Responses'], ['quotes', '◎ Quotes to Buyers'], ['new', '+ New Enquiry'], ['master', '◉ Master Data'], ['users', '◷ User Manager']],
  purchaser: [['enquiries', '≡ My Enquiries'], ['new', '+ New Enquiry']],
  supplier:  [['enquiries', '≡ Browse Enquiries'], ['responses', '◈ My Responses']],
}

export function Navbar({ tab, setTab }) {
  const { profile, signOut } = useAuth()
  const { isDark, toggle } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  if (!profile) return null

  const rc = roleConfig[profile.role] || roleConfig.purchaser
  const navTabs = tabs[profile.role] || []

  return (
    <div style={{
      width: collapsed ? 60 : 220,
      minHeight: '100vh',
      background: isDark ? '#0D0D0D' : '#FFFFFF',
borderRight: `1px solid ${isDark ? '#1A1A1A' : '#E0DDD8'}`,
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
      transition: 'width 0.25s ease',
      overflow: 'hidden',
    }}>

      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px',
        borderBottom: `1px solid ${isDark ? '#1A1A1A' : '#E0DDD8'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, flexShrink: 0,
            background: 'linear-gradient(135deg, #C8A96E, #8B6E3A)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#0A0A0A',
            fontFamily: 'Georgia, serif',
            boxShadow: '0 4px 12px #C8A96E33',
          }}>P</div>
          {!collapsed && (
            <span style={{
              fontFamily: 'Georgia, serif',
              fontSize: 16, fontWeight: 700,
              color: isDark ? '#E8E0D0' : '#1A1A1A', letterSpacing: 0.5,
              whiteSpace: 'nowrap',
            }}>PaperLink</span>
          )}
        </div>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{
            background: 'transparent', border: 'none',
            color: '#444', cursor: 'pointer', fontSize: 16, padding: 4,
          }}>‹</button>
        )}
      </div>

      {collapsed && (
        <button onClick={() => setCollapsed(false)} style={{
          background: 'transparent', border: 'none',
          color: '#444', cursor: 'pointer', fontSize: 16,
          padding: '10px 0', textAlign: 'center',
        }}>›</button>
      )}

      {/* Role badge */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${isDark ? '#1A1A1A' : '#E0DDD8'}` }}>
          <div style={{
            background: rc.bg,
            border: `1px solid ${rc.color}33`,
            borderRadius: 6,
            padding: '6px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: rc.color, flexShrink: 0 }} />
            <div>
              <div style={{ color: rc.color, fontSize: 10, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                {rc.label}
              </div>
              <div style={{ color: '#555', fontSize: 11, fontFamily: '"DM Mono", monospace', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                {profile.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!collapsed && (
          <div style={{ color: isDark ? '#333' : '#AAA', fontSize: 10, fontFamily: '"DM Mono", monospace', letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 8px', marginBottom: 4 }}>
            Menu
          </div>
        )}
        {navTabs.map(([key, label]) => {
          const isActive = tab === key
          const icon = label.split(' ')[0]
          const text = label.slice(label.indexOf(' ') + 1)
          return (
            <button key={key} onClick={() => setTab(key)} style={{
              background: isActive ? '#C8A96E18' : 'transparent',
              color: isActive ? '#C8A96E' : isDark ? '#555' : '#888',
              border: `1px solid ${isActive ? '#C8A96E33' : 'transparent'}`,
              borderRadius: 7,
              padding: collapsed ? '10px 0' : '10px 12px',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: '"DM Mono", monospace',
              fontWeight: isActive ? 500 : 400,
              letterSpacing: 0.2,
              transition: 'all 0.15s',
              textAlign: collapsed ? 'center' : 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              whiteSpace: 'nowrap',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = isDark ? '#1A1A1A' : '#F5F3EF'; e.currentTarget.style.color = '#888' }}}
onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isDark ? '#555' : '#888' }}}
            >
              <span style={{ fontSize: 15 }}>{icon}</span>
              {!collapsed && <span>{text}</span>}
            </button>
          )
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: collapsed ? '12px 8px' : '12px 10px', borderTop: `1px solid ${isDark ? '#1A1A1A' : '#E0DDD8'}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
  <button onClick={toggle} style={{
    background: 'transparent', color: isDark ? '#555' : '#888',
border: `1px solid ${isDark ? '#1E1E1E' : '#E0DDD8'}`, borderRadius: 7,
    padding: collapsed ? '10px 0' : '10px 12px',
    cursor: 'pointer', fontSize: 12,
    fontFamily: '"DM Mono", monospace',
    width: '100%', display: 'flex', alignItems: 'center',
    gap: 8, justifyContent: collapsed ? 'center' : 'flex-start',
    transition: 'all 0.15s',
  }}>
    <span>{isDark ? '○' : '●'}</span>
    {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
  </button>
        <button onClick={signOut} style={{
          background: 'transparent', color: isDark ? '#444' : '#888',
border: `1px solid ${isDark ? '#1E1E1E' : '#E0DDD8'}`, borderRadius: 7,
          padding: collapsed ? '10px 0' : '10px 12px',
          cursor: 'pointer', fontSize: 12,
          fontFamily: '"DM Mono", monospace',
          width: '100%', display: 'flex', alignItems: 'center',
          gap: 8, justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#C86E6E'; e.currentTarget.style.borderColor = '#C86E6E44' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.borderColor = '#1E1E1E' }}
        >
          <span>→</span>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )
}