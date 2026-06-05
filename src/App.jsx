import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PurchaserPage from './pages/PurchaserPage'
import SupplierPage  from './pages/SupplierPage'
import AdminPage     from './pages/AdminPage'
import { C } from './lib/constants'

function ProtectedApp() {
  const { user, profile, loading } = useAuth()
  const [tab, setTab] = useState('enquiries')

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 13 }}>
      Loading…
    </div>
  )

  if (!user || !profile) return <Navigate to="/login" replace />

  const Page = { admin: AdminPage, purchaser: PurchaserPage, supplier: SupplierPage }[profile.role]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <Navbar tab={tab} setTab={setTab} />
      {Page ? <Page tab={tab} setTab={setTab} /> : <div style={{ padding: 24, color: C.red }}>Unknown role: {profile.role}</div>}
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
