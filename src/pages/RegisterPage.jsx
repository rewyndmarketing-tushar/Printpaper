import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'purchaser' })
  const [err, setErr]         = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

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

  const inputStyle = (name) => ({
    width: '100%',
    background: '#0F0F0F',
    border: `1px solid ${focused === name ? '#C8A96E55' : '#1E1E1E'}`,
    borderRadius: 6,
    padding: '11px 14px',
    color: '#E0D8CC',
    fontSize: 13.5,
    fontFamily: '"DM Mono", monospace',
    outline: 'none',
    transition: 'border-color 0.2s',
    letterSpacing: 0.3,
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 48, height: 48,
            background: 'linear-gradient(135deg, #C8A96E, #8B6E3A)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 22, fontWeight: 700, color: '#0A0A0A',
            fontFamily: 'Georgia, serif',
            boxShadow: '0 8px 32px #C8A96E22',
          }}>P</div>
          <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 26, fontWeight: 700, color: '#E8E0D0', marginBottom: 6 }}>
            Create Account
          </div>
          <div style={{ color: '#444', fontSize: 12, fontFamily: '"DM Mono", monospace', letterSpacing: 1 }}>
            JOIN PAPERLINK MARKETPLACE
          </div>
        </div>

        {/* Role selector cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { value: 'purchaser', label: 'Purchaser', desc: 'I buy paper materials', icon: '📦', color: '#6E9EC8' },
            { value: 'supplier',  label: 'Supplier',  desc: 'I supply paper materials', icon: '🏭', color: '#6EC89E' },
          ].map(r => (
            <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
              style={{
                background: form.role === r.value ? r.color + '11' : '#111',
                border: `1px solid ${form.role === r.value ? r.color + '55' : '#1E1E1E'}`,
                borderRadius: 8, padding: '14px 12px',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{r.icon}</div>
              <div style={{ color: form.role === r.value ? r.color : '#888', fontSize: 12.5, fontWeight: 700, fontFamily: '"DM Mono", monospace', marginBottom: 2 }}>{r.label}</div>
              <div style={{ color: '#444', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>{r.desc}</div>
            </button>
          ))}
        </div>

        {/* Form card */}
        <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: 12, padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
          <form onSubmit={submit}>
            {[
              { key: 'name', label: 'Company / Full Name', placeholder: 'e.g. Raj Traders', type: 'text' },
              { key: 'email', label: 'Email Address', placeholder: 'your@email.com', type: 'email' },
              { key: 'password', label: 'Password', placeholder: 'Min 6 characters', type: 'password' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#666', fontSize: 11, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                  {field.label}
                </label>
                <input
                  style={inputStyle(field.key)}
                  type={field.type}
                  value={form[field.key]}
                  onChange={set(field.key)}
                  onFocus={() => setFocused(field.key)}
                  onBlur={() => setFocused(null)}
                  placeholder={field.placeholder}
                  required
                  minLength={field.key === 'password' ? 6 : undefined}
                />
              </div>
            ))}

            {err && (
              <div style={{ background: '#2A0E0E', border: '1px solid #5A1A1A', borderRadius: 6, padding: '10px 14px', color: '#E07070', fontSize: 12, fontFamily: '"DM Mono", monospace', marginBottom: 16 }}>
                {err}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? '#2A2215' : 'linear-gradient(135deg, #C8A96E, #A8893E)',
              color: '#0A0A0A', border: 'none', borderRadius: 7,
              padding: '12px', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
              fontFamily: '"DM Mono", monospace',
              boxShadow: loading ? 'none' : '0 4px 20px #C8A96E33',
              transition: 'all 0.2s',
            }}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: '#444', fontSize: 12.5, fontFamily: '"DM Mono", monospace' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#C8A96E', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}