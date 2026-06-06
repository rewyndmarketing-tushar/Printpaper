import { supabase } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { C } from '../lib/constants'

const CATEGORIES = [
  { key: 'paper_types', label: 'Paper Types', icon: '📄', color: '#6E9EC8' },
  { key: 'shades',      label: 'Shades',      icon: '🎨', color: '#C86E9E' },
  { key: 'gsm',         label: 'GSM Options', icon: '⚖️',  color: '#6EC89E' },
  { key: 'coatings',    label: 'Coatings',    icon: '✨', color: '#C8A96E' },
]

const DEFAULT_DATA = {
  paper_types: ['Duplex GB (Grey Back)', 'Duplex WB (White Back)', 'Sapphire', 'SBS', 'Art Paper', 'Maplito'],
  shades:      ['Blue Tone', 'Natural', 'White', 'Cream'],
  gsm:         ['170', '200', '210', '230', '250', '270', '300', '350', '400'],
  coatings:    ['Coated (C)', 'Uncoated (UC)'],
}

const inp = {
  background: '#0F0F0F',
  border: `1px solid #2A2A2A`,
  borderRadius: 6,
  padding: '9px 14px',
  color: C.text,
  fontSize: 13,
  fontFamily: '"DM Mono", monospace',
  outline: 'none',
  width: '100%',
}

export default function MasterPage() {
  const [data, setData]         = useState(DEFAULT_DATA)
  const [activeTab, setActiveTab] = useState('paper_types')
  const [newItem, setNewItem]   = useState('')
  const [editIdx, setEditIdx]   = useState(null)
  const [editVal, setEditVal]   = useState('')
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    async function fetchMaster() {
      const { data: rows } = await supabase.from('master_data').select('*')
      if (rows && rows.length > 0) {
        const d = {}
        rows.forEach(r => { d[r.id] = r.items })
        setData(prev => ({ ...prev, ...d }))
      }
    }
    fetchMaster()
  }, [])

  const save = async (newData) => {
    setData(newData)
    await supabase.from('master_data').upsert({ id: activeTab, items: newData[activeTab], updated_at: new Date().toISOString() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addItem = () => {
    if (!newItem.trim()) return
    const updated = { ...data, [activeTab]: [...data[activeTab], newItem.trim()] }
    save(updated)
    setNewItem('')
  }

  const deleteItem = (idx) => {
    const updated = { ...data, [activeTab]: data[activeTab].filter((_, i) => i !== idx) }
    save(updated)
  }

  const startEdit = (idx) => {
    setEditIdx(idx)
    setEditVal(data[activeTab][idx])
  }

  const saveEdit = () => {
    if (!editVal.trim()) return
    const items = [...data[activeTab]]
    items[editIdx] = editVal.trim()
    save({ ...data, [activeTab]: items })
    setEditIdx(null)
    setEditVal('')
  }

  const moveUp = (idx) => {
    if (idx === 0) return
    const items = [...data[activeTab]]
    ;[items[idx - 1], items[idx]] = [items[idx], items[idx - 1]]
    save({ ...data, [activeTab]: items })
  }

  const moveDown = (idx) => {
    const items = [...data[activeTab]]
    if (idx === items.length - 1) return
    ;[items[idx], items[idx + 1]] = [items[idx + 1], items[idx]]
    save({ ...data, [activeTab]: items })
  }

  const resetCategory = () => {
    if (!confirm(`Reset ${activeTab} to defaults?`)) return
    save({ ...data, [activeTab]: DEFAULT_DATA[activeTab] })
  }

  const cat = CATEGORIES.find(c => c.key === activeTab)
  const items = data[activeTab] || []

  return (
    <div style={{ padding: '32px 36px', maxWidth: 800 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: C.muted2, fontFamily: '"DM Mono", monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
          Admin · Settings
        </div>
        <div style={{ fontSize: 22, fontFamily: '"Playfair Display", Georgia, serif', color: C.text, fontWeight: 700, marginBottom: 6 }}>
          Master Data
        </div>
        <div style={{ fontSize: 12, color: C.muted, fontFamily: '"DM Mono", monospace' }}>
          Manage dropdown options shown to purchasers and suppliers
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => { setActiveTab(cat.key); setEditIdx(null); setNewItem('') }}
            style={{
              background: activeTab === cat.key ? cat.color + '18' : C.surface,
              color: activeTab === cat.key ? cat.color : C.muted,
              border: `1px solid ${activeTab === cat.key ? cat.color + '44' : C.border}`,
              borderRadius: 8, padding: '10px 18px',
              cursor: 'pointer', fontSize: 12.5,
              fontFamily: '"DM Mono", monospace',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s',
            }}>
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span style={{ background: cat.color + '22', color: cat.color, borderRadius: 10, padding: '1px 7px', fontSize: 10 }}>
              {data[cat.key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Main panel */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>

        {/* Panel header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{cat?.icon}</span>
            <span style={{ color: C.text, fontSize: 14, fontFamily: '"DM Mono", monospace', fontWeight: 500 }}>{cat?.label}</span>
            <span style={{ background: cat?.color + '22', color: cat?.color, borderRadius: 10, padding: '2px 8px', fontSize: 11 }}>
              {items.length} items
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {saved && <span style={{ color: C.green, fontSize: 11, fontFamily: '"DM Mono", monospace' }}>✓ Saved</span>}
            <button onClick={resetCategory} style={{ background: 'transparent', color: C.muted2, border: `1px solid ${C.border}`, borderRadius: 5, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>
              Reset defaults
            </button>
          </div>
        </div>

        {/* Items list */}
        <div style={{ padding: '12px 16px' }}>
          {items.length === 0 && (
            <div style={{ color: C.muted, fontSize: 13, fontFamily: '"DM Mono", monospace', padding: '20px 0', textAlign: 'center' }}>
              No items yet — add one below
            </div>
          )}
          {items.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 6,
              background: editIdx === idx ? C.card : 'transparent',
              border: `1px solid ${editIdx === idx ? C.border : 'transparent'}`,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (editIdx !== idx) e.currentTarget.style.background = '#141414' }}
            onMouseLeave={e => { if (editIdx !== idx) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Order number */}
              <span style={{ color: C.muted2, fontSize: 11, fontFamily: '"DM Mono", monospace', width: 20, textAlign: 'right', flexShrink: 0 }}>
                {idx + 1}
              </span>

              {/* Item value */}
              {editIdx === idx ? (
                <input
                  style={{ ...inp, flex: 1 }}
                  value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditIdx(null) }}
                  autoFocus
                />
              ) : (
                <span style={{ flex: 1, color: C.text, fontSize: 13, fontFamily: '"DM Mono", monospace' }}>{item}</span>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {editIdx === idx ? (
                  <>
                    <button onClick={saveEdit} style={{ background: C.green + '22', color: C.green, border: `1px solid ${C.green}33`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>Save</button>
                    <button onClick={() => setEditIdx(null)} style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} title="Move up" style={{ background: 'transparent', color: idx === 0 ? C.muted2 : C.muted, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 8px', cursor: idx === 0 ? 'default' : 'pointer', fontSize: 12 }}>↑</button>
                    <button onClick={() => moveDown(idx)} disabled={idx === items.length - 1} title="Move down" style={{ background: 'transparent', color: idx === items.length - 1 ? C.muted2 : C.muted, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 8px', cursor: idx === items.length - 1 ? 'default' : 'pointer', fontSize: 12 }}>↓</button>
                    <button onClick={() => startEdit(idx)} style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}33`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>Edit</button>
                    <button onClick={() => deleteItem(idx)} style={{ background: 'transparent', color: C.red, border: `1px solid ${C.red}33`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add new item */}
        <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10 }}>
          <input
            style={{ ...inp, flex: 1 }}
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder={`Add new ${cat?.label.toLowerCase().slice(0, -1)}…`}
          />
          <button onClick={addItem} style={{
            background: 'linear-gradient(135deg, #C8A96E, #A8893E)',
            color: '#0A0A0A', border: 'none', borderRadius: 7,
            padding: '9px 20px', cursor: 'pointer', fontSize: 12,
            fontFamily: '"DM Mono", monospace', fontWeight: 700,
            whiteSpace: 'nowrap', boxShadow: '0 4px 12px #C8A96E33',
          }}>
            + Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: '#0F1A0F', border: '1px solid #1A2A1A', borderRadius: 8, fontSize: 11, color: '#4A7A4A', fontFamily: '"DM Mono", monospace' }}>
        💡 Changes are saved automatically and reflected in all enquiry forms immediately.
      </div>
    </div>
  )
}