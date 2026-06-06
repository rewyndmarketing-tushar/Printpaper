import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useMessages, useNegotiations } from '../hooks/useNegotiation'
import { C } from '../lib/constants'

const msgTypeColor = {
  chat:         C.muted,
  price_update: C.green,
  rejection:    C.red,
  not_possible: '#C8756E',
}

const msgTypeLabel = {
  chat:         '',
  price_update: '₹ Price Update',
  rejection:    '✕ Rejected',
  not_possible: '— Not Possible',
}

export function NegotiationPanel({ enquiry, responses, onStatusChange, isDark }) {
  const { user, profile } = useAuth()
  const { messages, sendMessage } = useMessages(enquiry?.id)
  const { negotiations, latestNegotiation, createNegotiation, updateBuyerResponse } = useNegotiations(enquiry?.id)

  const [msg, setMsg]           = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [sending, setSending]   = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [activeAction, setActiveAction] = useState(null)

  const card   = isDark ? C.surface : '#FFFFFF'
  const border = isDark ? C.border  : '#E8E5E0'
  const text   = isDark ? C.text    : '#1A1A1A'
  const muted  = isDark ? C.muted   : '#888'
  const inp    = { background: isDark ? '#0F0F0F' : '#F5F3EF', border: `1px solid ${isDark ? '#2A2A2A' : '#E0DDD8'}`, borderRadius: 6, padding: '8px 12px', color: text, fontSize: 12, fontFamily: '"DM Mono", monospace', outline: 'none', width: '100%' }

  const sendChat = async () => {
    if (!msg.trim()) return
    setSending(true)
    try {
      // Determine receiver based on role
      const receiverId = profile.role === 'admin'
        ? (activeAction === 'supplier' ? responses[0]?.supplier_id : enquiry?.purchaser_id)
        : null // purchaser sends to admin

      await sendMessage({
        senderId: user.id,
        receiverId,
        senderRole: profile.role,
        message: msg,
        messageType: 'chat',
      })
      setMsg('')
    } catch (err) { alert(err.message) }
    finally { setSending(false) }
  }

  const sendPriceUpdate = async (targetRole) => {
    if (!newPrice) return
    setSending(true)
    try {
      const receiverId = targetRole === 'buyer' ? enquiry?.purchaser_id : responses[0]?.supplier_id
      await sendMessage({
        senderId: user.id,
        receiverId,
        senderRole: profile.role,
        message: `New price offer: ₹${newPrice}/kg`,
        messageType: 'price_update',
        price: parseFloat(newPrice),
      })
      if (targetRole === 'buyer') {
        await createNegotiation({ supplierPrice: responses[0]?.price_per_kg || 0, adminPrice: parseFloat(newPrice) })
      }
      setNewPrice('')
      setActiveAction(null)
      if (onStatusChange) onStatusChange()
    } catch (err) { alert(err.message) }
    finally { setSending(false) }
  }

  const sendNotPossible = async () => {
    setSending(true)
    try {
      await sendMessage({
        senderId: user.id,
        receiverId: enquiry?.purchaser_id,
        senderRole: 'admin',
        message: 'Sorry, we are unable to fulfil this enquiry at the moment.',
        messageType: 'not_possible',
      })
      await onStatusChange?.('closed')
    } catch (err) { alert(err.message) }
    finally { setSending(false) }
  }

  const handleBuyerReject = async () => {
    if (!rejectNote.trim()) return
    setSending(true)
    try {
      if (latestNegotiation) {
        await updateBuyerResponse(latestNegotiation.id, 'rejected', rejectNote)
      }
      await sendMessage({
        senderId: user.id,
        receiverId: null, // admin
        senderRole: 'purchaser',
        message: rejectNote,
        messageType: 'rejection',
      })
      setRejectNote('')
      setShowReject(false)
      if (onStatusChange) onStatusChange('responded')
    } catch (err) { alert(err.message) }
    finally { setSending(false) }
  }

  const isAdmin     = profile?.role === 'admin'
  const isBuyer     = profile?.role === 'purchaser'
  const isSupplier  = profile?.role === 'supplier'

  // Filter messages visible to current user
  const visibleMessages = messages.filter(m => {
    if (isAdmin) return true
    if (isBuyer) return m.sender_role !== 'supplier'
    if (isSupplier) return m.sender_role !== 'purchaser' && m.receiver_id === user.id
    return false
  })

  return (
    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', marginTop: 16 }}>

      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: text, fontFamily: '"DM Mono", monospace' }}>
          Negotiation · {negotiations.length > 0 ? `Round ${negotiations.length}` : 'Round 0'}
        </div>
        {negotiations.length > 0 && (
          <div style={{ fontSize: 11, color: muted, fontFamily: '"DM Mono", monospace' }}>
            Latest: ₹{latestNegotiation?.admin_price}/kg · {latestNegotiation?.buyer_response}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ padding: '12px 16px', maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visibleMessages.length === 0 && (
          <div style={{ color: muted, fontSize: 12, fontFamily: '"DM Mono", monospace', textAlign: 'center', padding: '20px 0' }}>
            No messages yet
          </div>
        )}
        {visibleMessages.map(m => {
          const isMe = m.sender_id === user.id
          const typeColor = msgTypeColor[m.message_type] || muted
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ fontSize: 10, color: muted, fontFamily: '"DM Mono", monospace', marginBottom: 3 }}>
                {m.profiles?.name || m.sender_role} · {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                {msgTypeLabel[m.message_type] && <span style={{ color: typeColor, marginLeft: 6 }}>{msgTypeLabel[m.message_type]}</span>}
              </div>
              <div style={{
                background: isMe ? C.accent + '22' : isDark ? '#1A1A1A' : '#F5F3EF',
                border: `1px solid ${isMe ? C.accent + '44' : border}`,
                borderRadius: 8, padding: '8px 12px',
                maxWidth: '75%',
                fontSize: 12.5, color: text, fontFamily: '"DM Mono", monospace',
              }}>
                {m.message_type === 'price_update' && m.price && (
                  <div style={{ fontSize: 16, color: C.green, fontWeight: 700, fontFamily: '"Playfair Display", serif', marginBottom: 4 }}>
                    ₹{m.price}/kg
                  </div>
                )}
                {m.message}
              </div>
            </div>
          )
        })}
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}` }}>
          {!activeAction ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <button onClick={() => setActiveAction('buyer_price')} style={{ background: C.green+'18', color: C.green, border: `1px solid ${C.green}33`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>
                ₹ Send Price to Buyer
              </button>
              <button onClick={() => setActiveAction('supplier_price')} style={{ background: C.blue+'18', color: C.blue, border: `1px solid ${C.blue}33`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>
                ↩ Ask Supplier for Better Price
              </button>
              <button onClick={() => setActiveAction('chat_buyer')} style={{ background: C.accent+'18', color: C.accent, border: `1px solid ${C.accent}33`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>
                ✉ Message Buyer
              </button>
              <button onClick={sendNotPossible} style={{ background: C.red+'18', color: C.red, border: `1px solid ${C.red}33`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>
                — Not Possible
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                {activeAction === 'buyer_price' ? 'New Price for Buyer (₹/kg)' :
                 activeAction === 'supplier_price' ? 'Target Price for Supplier (₹/kg)' :
                 'Message to Buyer'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {activeAction !== 'chat_buyer' ? (
                  <input style={{ ...inp, flex: 1 }} type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="e.g. 1100" autoFocus />
                ) : (
                  <input style={{ ...inp, flex: 1 }} value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type message…" autoFocus />
                )}
                <button onClick={() => {
                  if (activeAction === 'buyer_price') sendPriceUpdate('buyer')
                  else if (activeAction === 'supplier_price') sendPriceUpdate('supplier')
                  else sendChat()
                }} disabled={sending} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
                  Send
                </button>
                <button onClick={() => { setActiveAction(null); setNewPrice(''); setMsg('') }} style={{ background: 'transparent', color: muted, border: `1px solid ${border}`, borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buyer Actions */}
      {isBuyer && latestNegotiation?.buyer_response === 'pending' && (
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}` }}>
          {!showReject ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={async () => {
                await updateBuyerResponse(latestNegotiation.id, 'accepted')
                if (onStatusChange) onStatusChange('accepted')
              }} style={{ background: C.green+'18', color: C.green, border: `1px solid ${C.green}33`, borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 600 }}>
                ✓ Accept Price
              </button>
              <button onClick={() => setShowReject(true)} style={{ background: C.red+'18', color: C.red, border: `1px solid ${C.red}33`, borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace' }}>
                ✕ Reject
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 10, color: muted, fontFamily: '"DM Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Reason for rejection (sent to admin only)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1 }} value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="e.g. Price too high, need below ₹1000/kg" autoFocus />
                <button onClick={handleBuyerReject} disabled={sending} style={{ background: C.red+'18', color: C.red, border: `1px solid ${C.red}33`, borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>
                  Send
                </button>
                <button onClick={() => setShowReject(false)} style={{ background: 'transparent', color: muted, border: `1px solid ${border}`, borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 11, fontFamily: '"DM Mono", monospace' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat input for buyer */}
      {isBuyer && (
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}`, display: 'flex', gap: 8 }}>
          <input style={{ ...inp, flex: 1 }} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Message admin…" />
          <button onClick={sendChat} disabled={sending} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
            Send
          </button>
        </div>
      )}

      {/* Supplier chat */}
      {isSupplier && (
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}`, display: 'flex', gap: 8 }}>
          <input style={{ ...inp, flex: 1 }} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Message admin…" />
          <button onClick={sendChat} disabled={sending} style={{ background: 'linear-gradient(135deg, #C8A96E, #A8893E)', color: '#0A0A0A', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
            Send
          </button>
        </div>
      )}
    </div>
  )
}