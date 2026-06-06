import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signIn }  = useAuth()
  const navigate    = useNavigate()
  const [email, setEmail]     = useState('')
  const [pass,  setPass]      = useState('')
  const [err,   setErr]       = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      await signIn(email, pass)
      navigate('/')
    } catch (error) {
      setErr('Invalid email or password')
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
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
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
          <div style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 28,
            fontWeight: 700,
            color: '#E8E0D0',
            letterSpacing: 0.5,
            marginBottom: 6,
          }}>PaperLink</div>
          <div style={{ color: '#444', fontSize: 12.5, fontFamily: '"DM Mono", monospace', letterSpacing: 1 }}>
            PAPER MATERIAL MARKETPLACE
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#111',
          border: '1px solid #1E1E1E',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: '#E0D8CC', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Sign in</div>
            <div style={{ color: '#444', fontSize: 12, fontFamily: '"DM Mono", monospace' }}>Access your account</div>
          </div>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#666', fontSize: 11, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                Email Address
              </label>
              <input
                style={inputStyle('email')}
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="your@email.com"
                required autoFocus
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#666', fontSize: 11, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                Password
              </label>
              <input
                style={inputStyle('pass')}
                type="password" value={pass}
                onChange={e => setPass(e.target.value)}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                required
              />
            </div>

            {err && (
              <div style={{
                background: '#2A0E0E', border: '1px solid #5A1A1A',
                borderRadius: 6, padding: '10px 14px',
                color: '#E07070', fontSize: 12.5,
                fontFamily: '"DM Mono", monospace',
                marginBottom: 16,
              }}>{err}</div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#2A2215' : 'linear-gradient(135deg, #C8A96E, #A8893E)',
                color: '#0A0A0A',
                border: 'none',
                borderRadius: 7,
                padding: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.5,
                fontFamily: '"DM Mono", monospace',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 20px #C8A96E33',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: '#444', fontSize: 12.5, fontFamily: '"DM Mono", monospace' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#C8A96E', textDecoration: 'none' }}>Register here</Link>
        </div>
      </div>
    </div>
  )
}