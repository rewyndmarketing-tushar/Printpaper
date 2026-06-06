import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useMessages(enquiryId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)

  async function fetchMessages() {
    if (!enquiryId) return
    setLoading(true)
    const { data } = await supabase
      .from('enquiry_messages')
      .select('*, profiles!sender_id(name, role)')
      .eq('enquiry_id', enquiryId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
    const channel = supabase
      .channel(`messages-${enquiryId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiry_messages', filter: `enquiry_id=eq.${enquiryId}` }, fetchMessages)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [enquiryId])

  async function sendMessage({ senderId, receiverId, senderRole, message, messageType = 'chat', price = null }) {
    const { data, error } = await supabase
      .from('enquiry_messages')
      .insert({ enquiry_id: enquiryId, sender_id: senderId, receiver_id: receiverId, sender_role: senderRole, message, message_type: messageType, price })
      .select().single()
    if (error) throw error
    await fetchMessages()
    return data
  }

  return { messages, loading, sendMessage, refetch: fetchMessages }
}

export function useNegotiations(enquiryId) {
  const [negotiations, setNegotiations] = useState([])
  const [loading, setLoading]           = useState(true)

  async function fetchNegotiations() {
    if (!enquiryId) return
    setLoading(true)
    const { data } = await supabase
      .from('enquiry_negotiations')
      .select('*')
      .eq('enquiry_id', enquiryId)
      .order('round', { ascending: true })
    setNegotiations(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchNegotiations() }, [enquiryId])

  async function createNegotiation({ supplierPrice, adminPrice }) {
    const round = negotiations.length + 1
    const { data, error } = await supabase
      .from('enquiry_negotiations')
      .insert({ enquiry_id: enquiryId, round, supplier_price: supplierPrice, admin_price: adminPrice, buyer_response: 'pending' })
      .select().single()
    if (error) throw error
    await fetchNegotiations()
    return data
  }

  async function updateBuyerResponse(negotiationId, response, note = '') {
    await supabase
      .from('enquiry_negotiations')
      .update({ buyer_response: response, rejection_note: note })
      .eq('id', negotiationId)
    await fetchNegotiations()
  }

  const latestNegotiation = negotiations[negotiations.length - 1]

  return { negotiations, loading, latestNegotiation, createNegotiation, updateBuyerResponse, refetch: fetchNegotiations }
}