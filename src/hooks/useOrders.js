import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useOrders({ userId, role } = {}) {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchOrders() {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*, enquiries(paper_type, gsm, quantity, unit, coating, shade), quotes(quoted_price, message)')
      .order('created_at', { ascending: false })

    if (role === 'purchaser' && userId) {
      query = query.eq('purchaser_id', userId)
    }

    const { data } = await query
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId, role])

  async function createOrder({ enquiryId, quoteId, purchaserId }) {
    const { data, error } = await supabase
      .from('orders')
      .insert({ enquiry_id: enquiryId, quote_id: quoteId, purchaser_id: purchaserId, status: 'confirmed' })
      .select().single()
    if (error) throw error
    // Update enquiry status to closed
    await supabase.from('enquiries').update({ status: 'closed' }).eq('id', enquiryId)
    await fetchOrders()
    return data
  }

  async function updateStatus(orderId, status) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    await fetchOrders()
  }

  return { orders, loading, createOrder, updateStatus, refetch: fetchOrders }
}