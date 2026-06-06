import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { C } from '../lib/constants'

const roleColor = {
  admin:     '#C8A96E',
  purchaser: '#6E9EC8',
  supplier:  '#6EC89E',
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function UserManagerPage() {
  const { isDark } = useTheme()
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [pwdModal, setPwdModal] = useState(null)
  const [newPwd, setNewPwd]     = useState('')
  const [pwdMsg, setPwdMsg]     = useState('')
  const [saving, setSaving]     = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [newUser, setNewUser]   = useState({ name: '', email: '', password: '', role: 'purchaser' })
  const [addMsg, setAddMsg]     = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = users.filter(u => {
    const matchRole   = filterRole === 'all' || u.role === filterRole
    const matchSearch = search.trim() === '' ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const handlePasswordReset = async () => {
    if (!newPwd || newPwd.length < 6) { setPwdMsg('Min 6 characters'); return }
    setSaving(true); setPwdMsg('')
    await supabase.auth.resetPasswordForEmail(pwdModal.email)
    setPwdMsg('✓ Password reset email sent to user')
    setSaving(false)
    setNewPwd('')
    setTimeout(() => { setPwdModal(null); setPwdMsg('') }, 2000)
  }

  const handleBan = async (user) => {
    await supabase.from('profiles').update({ banned: !user.banned }).eq('id', user.id)
    fetchUsers()
  }

  const inp = {
    background: isDark ? '#0F0F0F' : '#F5F3EF',
    border: `1px solid ${isDark ? '#2A2A2A' : '#E0DDD8'}`,
    borderRadius: 6, padding: '9px 14px',
    color: isDark ? C.text : '#1A1A1A',
    fontSize: 13, fontFamily: '"DM Mono", monospace', outline: 'none',
  }

  return (
    <div style={{ padding: '32px 36px', color: isDark ? C.text : '#1A1A1A' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Admin · Users</div>
          <div style={{ fontSize: 22, fontFamily: '"Playfair Display", Georgia, serif', color: isDark ? C.text : '#1A1A1A', fontWeight: 700, marginBottom: 4 }}>User Manager</div>
          <div style={{ fontSize: 12, color: C.muted, fontFamily: '"DM Mono", monospace' }}>Manage access, passwords and login status</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setAddModal(true)} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
            + Add User
          </button>
          <button onClick={fetchUsers} style={{ background: isDark ? C.surface : '#F0EDE8', color: C.muted, border: `1px solid ${isDark ? C.border : '#E0DDD8'}`, borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace' }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input style={{ ...inp, width: '100%' }} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', padding: '12px 20px', borderBottom: `1px solid ${isDark ? C.border : '#E8E5E0'}`, background: isDark ? C.card : '#F5F3EF' }}>
          {['User', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
            <div key={h} style={{ fontSize: 10.5, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>

        {loading && <div style={{ padding: 24, color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>Loading…</div>}
        {!loading && filtered.length === 0 && <div style={{ padding: 24, color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>No users found</div>}
        {filtered.map((u, i) => {
          const rc = roleColor[u.role] || C.muted
          const isBanned = u.banned
          return (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
              padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? `1px solid ${isDark ? C.border : '#E8E5E0'}` : 'none',
              alignItems: 'center',
              background: isBanned ? '#1A0A0A' : 'transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!isBanned) e.currentTarget.style.background = isDark ? '#141414' : '#F8F6F2' }}
            onMouseLeave={e => { if (!isBanned) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isBanned ? C.red : C.green, flexShrink: 0 }} />
                <div>
                  <div style={{ color: isDark ? C.text : '#1A1A1A', fontSize: 13, fontFamily: '"DM Mono", monospace' }}>{u.email}</div>
                  <div style={{ color: C.muted, fontSize: 11, fontFamily: '"DM Mono", monospace', marginTop: 2 }}>{u.name}</div>
                </div>
              </div>

              <div>
                <span style={{ background: rc + '18', color: rc, border: `1px solid ${rc}33`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontFamily: '"DM Mono", monospace', textTransform: 'capitalize' }}>
                  {u.role}
                </span>
              </div>

              <div style={{ color: C.muted, fontSize: 12, fontFamily: '"DM Mono", monospace' }}>
                {timeAgo(u.created_at)}
              </div>

              <div>
                <span style={{ background: isBanned ? C.red + '18' : C.green + '18', color: isBanned ? C.red : C.green, border: `1px solid ${isBanned ? C.red : C.green}33`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>
                  {isBanned ? 'Banned' : 'Active'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setPwdModal(u); setNewPwd(''); setPwdMsg('') }} style={{ background: isDark ? '#1A1E2A' : '#EEF4FB', color: '#6E9EC8', border: '1px solid #2A3A5A', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 11.5, fontFamily: '"DM Mono", monospace' }}>
                  ⚿ Password
                </button>
                {u.role !== 'admin' && (
                  <button onClick={() => handleBan(u)} style={{ background: isBanned ? '#1A2A1A' : isDark ? '#2A1A1A' : '#FEF0F0', color: isBanned ? C.green : C.red, border: `1px solid ${isBanned ? C.green : C.red}33`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 11.5, fontFamily: '"DM Mono", monospace' }}>
                    {isBanned ? '✓ Unban' : '✕ Ban'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 16 }}>
        {[
          { label: 'Total Users', value: users.length,                                        color: C.accent },
          { label: 'Purchasers',  value: users.filter(u => u.role === 'purchaser').length,    color: '#6E9EC8' },
          { label: 'Suppliers',   value: users.filter(u => u.role === 'supplier').length,     color: '#6EC89E' },
          { label: 'Banned',      value: users.filter(u => u.banned).length,                  color: C.red },
        ].map(s => (
          <div key={s.label} style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontFamily: '"Playfair Display", serif', color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {addModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000AA', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 12, padding: 28, width: 380, boxShadow: '0 24px 80px #000' }}>
            <div style={{ fontSize: 16, fontFamily: '"Playfair Display", serif', color: isDark ? C.text : '#1A1A1A', fontWeight: 700, marginBottom: 4 }}>Add New User</div>
            <div style={{ fontSize: 12, color: C.muted, fontFamily: '"DM Mono", monospace', marginBottom: 20 }}>Create account directly from admin panel</div>
            {[
              { key: 'name', label: 'Name / Company', placeholder: 'e.g. Raj Traders', type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'user@email.com', type: 'email' },
              { key: 'password', label: 'Password', placeholder: 'Min 6 characters', type: 'password' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</div>
                <input style={{ ...inp, width: '100%' }} type={f.type} placeholder={f.placeholder}
                  value={newUser[f.key]} onChange={e => setNewUser(u => ({ ...u, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Role</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['purchaser', 'supplier', 'admin'].map(r => (
                  <button key={r} onClick={() => setNewUser(u => ({ ...u, role: r }))} style={{
                    flex: 1, background: newUser.role === r ? roleColor[r] + '18' : 'transparent',
                    color: newUser.role === r ? roleColor[r] : C.muted,
                    border: `1px solid ${newUser.role === r ? roleColor[r] + '44' : isDark ? C.border : '#E8E5E0'}`,
                    borderRadius: 6, padding: '7px 0', cursor: 'pointer',
                    fontSize: 11, fontFamily: '"DM Mono", monospace', textTransform: 'capitalize',
                  }}>{r}</button>
                ))}
              </div>
            </div>
            {addMsg && <div style={{ fontSize: 12, color: addMsg.includes('✓') ? C.green : C.red, fontFamily: '"DM Mono", monospace', marginBottom: 12 }}>{addMsg}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={async () => {
                if (!newUser.name || !newUser.email || !newUser.password) { setAddMsg('All fields required'); return }
                setSaving(true); setAddMsg('')
                const { data, error } = await supabase.auth.signUp({ email: newUser.email, password: newUser.password })
                if (error) { setAddMsg(error.message); setSaving(false); return }
                await supabase.from('profiles').insert({ id: data.user.id, email: newUser.email, name: newUser.name, role: newUser.role })
                setAddMsg('✓ User created successfully!')
                fetchUsers()
                setTimeout(() => { setAddModal(false); setAddMsg(''); setNewUser({ name: '', email: '', password: '', role: 'purchaser' }) }, 1500)
                setSaving(false)
              }} disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 7, padding: '10px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
                {saving ? 'Creating…' : 'Create User'}
              </button>
              <button onClick={() => { setAddModal(false); setAddMsg('') }} style={{ background: 'transparent', color: C.muted, border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 7, padding: '10px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {pwdModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000AA', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: isDark ? C.surface : '#FFFFFF', border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 12, padding: 28, width: 360, boxShadow: '0 24px 80px #000' }}>
            <div style={{ fontSize: 16, fontFamily: '"Playfair Display", serif', color: isDark ? C.text : '#1A1A1A', fontWeight: 700, marginBottom: 4 }}>Reset Password</div>
            <div style={{ fontSize: 12, color: C.muted, fontFamily: '"DM Mono", monospace', marginBottom: 20 }}>{pwdModal.email}</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>New Password</div>
              <input style={{ ...inp, width: '100%' }} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min 6 characters" autoFocus />
            </div>
            {pwdMsg && <div style={{ fontSize: 12, color: pwdMsg.includes('✓') ? C.green : C.red, fontFamily: '"DM Mono", monospace', marginBottom: 12 }}>{pwdMsg}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handlePasswordReset} disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 7, padding: '10px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
                {saving ? 'Saving…' : 'Update Password'}
              </button>
              <button onClick={() => setPwdModal(null)} style={{ background: 'transparent', color: C.muted, border: `1px solid ${isDark ? C.border : '#E8E5E0'}`, borderRadius: 7, padding: '10px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}