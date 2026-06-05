import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { C } from '../lib/constants'

const s = {
  label:  { fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, display: 'block' },
  input:  { background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '9px 12px', color: C.text, fontSize: 13, fontFamily: 'inherit', width: '100%', outline: 'none', boxSizing: 'border-box' },
}

export default function LoginPage() {
  const { signIn }  = useAuth()
  const navigate    = useNavigate()
  const [email, setEmail]   = useState('')
  const [pass,  setPass]    = useState('')
  const [err,   setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      await signIn(email, pass)
      navigate('/')
    } catch (error) {
      setErr(error.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 34, color: C.accent }}>PaperLink</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>Paper material marketplace</div>
        </div>

        <form onSubmit={submit} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 28 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required autoFocus />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" required />
          </div>
          {err && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{err}</div>}
          <button type="submit" disabled={loading} style={{ background: C.accent, color: '#0F0E0C', border: 'none', borderRadius: 6, padding: '10px', width: '100%', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: C.muted }}>
          No account?{' '}
          <Link to="/register" style={{ color: C.accent, textDecoration: 'none' }}>Register here</Link>
        </div>
      </div>
    </div>
  )
}
