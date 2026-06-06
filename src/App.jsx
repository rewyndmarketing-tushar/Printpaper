import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PurchaserPage from './pages/PurchaserPage'
import SupplierPage  from './pages/SupplierPage'
import AdminPage     from './pages/AdminPage'

function ProtectedApp() {
  const { user, profile, loading } = useAuth()
  const [tab, setTab] = useState('enquiries')

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 13, fontFamily: '"DM Mono", monospace' }}>
      Loading…
    </div>
  )

  if (!user || !profile) return <Navigate to="/login" replace />

  const Page = { admin: AdminPage, purchaser: PurchaserPage, supplier: SupplierPage }[profile.role]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      <Navbar tab={tab} setTab={setTab} />
      {/* Main content — offset by sidebar width */}
      <div style={{ marginLeft: 220, flex: 1, minHeight: '100vh', transition: 'margin-left 0.25s ease' }}>
        {Page ? <Page tab={tab} setTab={setTab} /> : <div style={{ padding: 24, color: '#C86E6E' }}>Unknown role: {profile.role}</div>}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*"        element={<ProtectedApp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}