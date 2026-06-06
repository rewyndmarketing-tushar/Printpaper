import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { C } from '../lib/constants'

export default function DashboardPage({ setTab }) {
  const { isDark } = useTheme()
  const [enquiries, setEnquiries] = useState([])
  const [responses, setResponses] = useState([])
  const [quotes, setQuotes]       = useState([])
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const [e, r, q, u] = await Promise.all([
        supabase.from('enquiries').select('*, profiles(name, role)').order('created_at', { ascending: false }),
        supabase.from('supplier_responses').select('*, profiles(name)').order('created_at', { ascending: false }),
        supabase.from('quotes').select('*, enquiries(paper_type, quantity, unit, profiles(name))').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
      ])
      setEnquiries(e.data || [])
      setResponses(r.data || [])
      setQuotes(q.data || [])
      setUsers(u.data || [])
      setLoading(false)
    }
    fetchAll()
  }, [])

  const totalMargin = quotes.reduce((sum, q) => sum + (q.quoted_price - q.supplier_price) * (q.enquiries?.quantity || 0), 0)
  const totalRevenue = quotes.reduce((sum, q) => sum + q.quoted_price * (q.enquiries?.quantity || 0), 0)

  const bg = isDark ? C.bg : '#F0EDE8'
  const card = isDark ? C.surface : '#FFFFFF'
  const border = isDark ? C.border : '#E8E5E0'
  const text = isDark ? C.text : '#1A1A1A'
  const muted = isDark ? C.muted : '#888'

  const StatCard = ({ label, value, color, sub, onClick }) => (
    <div onClick={onClick} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: '20px 24px', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s', borderTop: `3px solid ${color}` }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: '"Playfair Display", serif', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: muted, fontFamily: '"DM Mono", monospace', marginTop: 4 }}>{sub}</div>}
    </div>
  )

  const th = { fontSize: 10, color: muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left', borderBottom: `1px solid ${border}`, background: isDark ? C.card : '#F8F6F2', whiteSpace: 'nowrap' }
  const td = { fontSize: 12.5, color: text, fontFamily: '"DM Mono", monospace', padding: '11px 16px', borderBottom: `1px solid ${isDark ? C.border : '#F0EDE8'}`, verticalAlign: 'middle' }

  // Top buyers
  const buyerMap = {}
  enquiries.forEach(e => {
    const name = e.profiles?.name || e.purchaser_id
    buyerMap[name] = (buyerMap[name] || 0) + 1
  })
  const topBuyers = Object.entries(buyerMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Top suppliers
  const supplierMap = {}
  responses.forEach(r => {
    const name = r.profiles?.name || r.supplier_id
    supplierMap[name] = (supplierMap[name] || 0) + 1
  })
  const topSuppliers = Object.entries(supplierMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  if (loading) return (
    <div style={{ padding: 40, color: muted, fontFamily: '"DM Mono", monospace', fontSize: 13 }}>Loading dashboard…</div>
  )

  return (
    <div style={{ padding: '28px 32px', background: bg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: muted, fontFamily: '"DM Mono", monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Admin · Overview</div>
        <div style={{ fontSize: 24, fontFamily: '"Playfair Display", serif', color: text, fontWeight: 700 }}>Dashboard</div>
      </div>

      {/* Stat cards row 1 — Enquiries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        <StatCard label="Open Enquiries"   value={enquiries.filter(e => e.status === 'open').length}      color="#6E9EC8" onClick={() => setTab('enquiries')} />
        <StatCard label="Responded"        value={enquiries.filter(e => e.status === 'responded').length}  color="#C8A96E" onClick={() => setTab('responses')} />
        <StatCard label="Quoted"           value={enquiries.filter(e => e.status === 'quoted').length}     color="#6EC89E" onClick={() => setTab('quotes')} />
        <StatCard label="Total Enquiries"  value={enquiries.length}                                         color={C.accent} onClick={() => setTab('enquiries')} />
      </div>

      {/* Stat cards row 2 — Business */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Revenue"  value={`₹${(totalRevenue/1000).toFixed(0)}K`}  color="#6EC89E" sub="from quoted orders" />
        <StatCard label="Total Margin"   value={`₹${(totalMargin/1000).toFixed(0)}K`}   color={C.accent} sub="your profit" />
        <StatCard label="Total Users"    value={users.length}                             color="#6E9EC8" sub={`${users.filter(u=>u.role==='purchaser').length} buyers · ${users.filter(u=>u.role==='supplier').length} suppliers`} onClick={() => setTab('users')} />
        <StatCard label="Quotes Sent"    value={quotes.length}                            color="#C86E9E" onClick={() => setTab('quotes')} />
      </div>

      {/* Main content: Recent enquiries + Top buyers/suppliers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

        {/* Recent Enquiries table */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: text, fontFamily: '"Playfair Display", serif' }}>Recent Enquiries</div>
            <button onClick={() => setTab('enquiries')} style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}33`, borderRadius: 5, padding: '4px 12px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>View All</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Date', 'Buyer', 'Paper Type', 'Qty', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {enquiries.slice(0, 8).map(e => {
                const sc = { open: '#6E9EC8', responded: '#C8A96E', quoted: '#6EC89E', closed: '#666' }[e.status] || '#666'
                return (
                  <tr key={e.id}
                    onMouseEnter={ev => ev.currentTarget.style.background = isDark ? '#161616' : '#FAFAF8'}
                    onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                    style={{ transition: 'background 0.1s', cursor: 'pointer' }}
                  >
                    <td style={{ ...td, color: muted, fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td style={{ ...td, color: '#6E9EC8', fontWeight: 500 }}>{e.profiles?.name || '—'}</td>
                    <td style={td}>{e.paper_type}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{e.quantity?.toLocaleString()} {e.unit}</td>
                    <td style={td}>
                      <span style={{ background: sc + '18', color: sc, border: `1px solid ${sc}33`, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>{e.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Top Buyers */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: text, fontFamily: '"Playfair Display", serif' }}>Top Buyers</div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {topBuyers.length === 0 && <div style={{ padding: '12px 18px', color: muted, fontSize: 12, fontFamily: '"DM Mono", monospace' }}>No data yet</div>}
              {topBuyers.map(([name, count], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#6E9EC822', color: '#6E9EC8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: '"DM Mono", monospace', fontWeight: 600 }}>{i + 1}</div>
                    <span style={{ fontSize: 12, color: text, fontFamily: '"DM Mono", monospace' }}>{name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: muted, fontFamily: '"DM Mono", monospace' }}>{count} enq</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Suppliers */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: text, fontFamily: '"Playfair Display", serif' }}>Top Suppliers</div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {topSuppliers.length === 0 && <div style={{ padding: '12px 18px', color: muted, fontSize: 12, fontFamily: '"DM Mono", monospace' }}>No data yet</div>}
              {topSuppliers.map(([name, count], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#6EC89E22', color: '#6EC89E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: '"DM Mono", monospace', fontWeight: 600 }}>{i + 1}</div>
                    <span style={{ fontSize: 12, color: text, fontFamily: '"DM Mono", monospace' }}>{name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: muted, fontFamily: '"DM Mono", monospace' }}>{count} resp</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Quotes */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: text, fontFamily: '"Playfair Display", serif' }}>Recent Quotes</div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {quotes.length === 0 && <div style={{ padding: '12px 18px', color: muted, fontSize: 12, fontFamily: '"DM Mono", monospace' }}>No quotes sent yet</div>}
              {quotes.slice(0, 4).map(q => (
                <div key={q.id} style={{ padding: '10px 18px', borderBottom: `1px solid ${isDark ? C.border : '#F5F3EF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: text, fontFamily: '"DM Mono", monospace' }}>{q.enquiries?.paper_type}</div>
                    <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, fontFamily: '"DM Mono", monospace' }}>₹{q.quoted_price}/kg</div>
                  </div>
                  <div style={{ fontSize: 11, color: muted, fontFamily: '"DM Mono", monospace', marginTop: 2 }}>
                    {q.enquiries?.profiles?.name} · +₹{q.quoted_price - q.supplier_price}/kg margin
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}