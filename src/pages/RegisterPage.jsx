import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { C, ROLES } from '../lib/constants'

const s = {
  label:  { fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, display: 'block' },
  input:  { background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '9px 12px', color: C.text, fontSize: 13, fontFamily: 'inherit', width: '100%', outline: 'none', boxSizing: 'border-box' },
  select: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '9px 12px', color: C.text, fontSize: 13, fontFamily: 'inherit', width: '100%', outline: 'none', boxSizing: 'border-box' },
}

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'purchaser' })
  const [err, setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      await signUp(form.email, form.password, form.name, form.role)
      navigate('/')
    } catch (error) {
      setErr(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 34, color: C.accent }}>PaperLink</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>Create your account</div>
        </div>

        <form onSubmit={submit} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 28 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Full Name / Company</label>
            <input style={s.input} value={form.name} onChange={set('name')} placeholder="e.g. Raj Traders" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" minLength={6} required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>I am a…</label>
            <select style={s.select} value={form.role} onChange={set('role')}>
              <option value="purchaser">Purchaser (I buy paper)</option>
              <option value="supplier">Supplier (I sell paper)</option>
            </select>
          </div>
          {err && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{err}</div>}
          <button type="submit" disabled={loading} style={{ background: C.accent, color: '#0F0E0C', border: 'none', borderRadius: 6, padding: '10px', width: '100%', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: C.muted }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: C.accent, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
