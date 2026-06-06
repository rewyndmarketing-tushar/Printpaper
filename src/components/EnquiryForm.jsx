import { useState } from 'react'
import { PAPER_TYPES, COATINGS, SHADES, GSM_OPTIONS, UNITS, C } from '../lib/constants'

const s = {
  label:  { fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, display: 'block' },
  input:  { background: '#0F0E0C', border: `1px solid ${C.border}`, borderRadius: 6, padding: '9px 12px', color: C.text, fontSize: 13, fontFamily: 'inherit', width: '100%', outline: 'none' },
  select: { background: '#0F0E0C', border: `1px solid ${C.border}`, borderRadius: 6, padding: '9px 12px', color: C.text, fontSize: 13, fontFamily: 'inherit', width: '100%', outline: 'none' },
  grid2:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
}

export function EnquiryForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    paperType: PAPER_TYPES[0], gsm: '230', coating: COATINGS[0],
    shade: SHADES[0], quantity: '', unit: 'sheets', sheetSize: '', grainSpec: '', notes: '',
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.quantity) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24 }}>
      <div style={s.grid2}>
        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>Paper Type</label>
          <select style={s.select} value={form.paperType} onChange={set('paperType')}>
            {PAPER_TYPES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>GSM</label>
          <select style={s.select} value={form.gsm} onChange={set('gsm')}>
            {GSM_OPTIONS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>Coating</label>
          <select style={s.select} value={form.coating} onChange={set('coating')}>
            {COATINGS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>Shade</label>
          <select style={s.select} value={form.shade} onChange={set('shade')}>
            {SHADES.map((sh) => <option key={sh}>{sh}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>Quantity</label>
          <input style={s.input} type="number" min="1" value={form.quantity} onChange={set('quantity')} placeholder="e.g. 2000" required />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>Unit</label>
          <select style={s.select} value={form.unit} onChange={set('unit')}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
          <label style={s.label}>Sheet Size</label>
          <input style={s.input} value={form.sheetSize} onChange={set('sheetSize')} placeholder="e.g. 22x30, 25x38" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>Grain Spec</label>
          <input style={s.input} value={form.grainSpec} onChange={set('grainSpec')} placeholder="e.g. Grain Long (GL)" />
        </div>

      <div style={{ marginBottom: 14 }}>
        <label style={s.label}>Notes (optional)</label>
        <textarea style={{ ...s.input, height: 68, resize: 'vertical' }} value={form.notes} onChange={set('notes')} placeholder="Delivery requirements, finish, urgency…" />
      </div>

      {/* Preview */}
      <div style={{ background: '#0F0E0C', border: `1px dashed ${C.border}`, borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.muted }}>
        Preview: <span style={{ color: C.text }}>{form.quantity || '?'} {form.unit} · {form.paperType} · {form.gsm} GSM · {form.coating} · {form.shade}</span>
      </div>

      <button type="submit" disabled={loading} style={{ background: C.accent, color: '#0F0E0C', border: 'none', borderRadius: 6, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>
        {loading ? 'Submitting…' : 'Submit Enquiry →'}
      </button>
    </form>
  )
}
