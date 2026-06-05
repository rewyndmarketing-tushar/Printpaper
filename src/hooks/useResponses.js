import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ── Supplier responses (visible only to admin + the supplier who sent it) ──
export function useResponses({ role, userId } = {}) {
  const [responses, setResponses] = useState([])
  const [loading, setLoading]     = useState(true)

  async function fetchResponses() {
    setLoading(true)
    let query = supabase
      .from('supplier_responses')
      .select('*, profiles(name), enquiries(paper_type, gsm, quantity, unit, purchaser_id)')
      .order('created_at', { ascending: false })

    if (role === 'supplier' && userId) {
      query = query.eq('supplier_id', userId)
    }

    const { data } = await query
    setResponses(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchResponses()
    const channel = supabase
      .channel('responses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supplier_responses' }, fetchResponses)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [role, userId])

  async function createResponse({ enquiryId, pricePerKg, location, note }) {
    const { data, error } = await supabase
      .from('supplier_responses')
      .insert({ enquiry_id: enquiryId, supplier_id: userId, price_per_kg: pricePerKg, location, note })
      .select()
      .single()
    if (error) throw error

    // Mark enquiry as responded
    await supabase.from('enquiries').update({ status: 'responded' }).eq('id', enquiryId)
    await fetchResponses()
    return data
  }

  return { responses, loading, refetch: fetchResponses, createResponse }
}

// ── Admin quotes (sent from admin to purchaser, hidden from supplier) ──
export function useQuotes({ role, userId } = {}) {
  const [quotes, setQuotes]   = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchQuotes() {
    setLoading(true)
    let query = supabase
      .from('quotes')
      .select('*, enquiries(paper_type, gsm, quantity, unit, purchaser_id, profiles(name)), supplier_responses(price_per_kg, location, profiles(name))')
      .order('created_at', { ascending: false })

    // Purchaser only sees their own quotes
    if (role === 'purchaser' && userId) {
      query = query.eq('purchaser_id', userId)
    }

    const { data } = await query
    setQuotes(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchQuotes()
    const channel = supabase
      .channel('quotes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, fetchQuotes)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [role, userId])

  async function sendQuote({ enquiryId, purchaserId, responseId, supplierPrice, quotedPrice, message }) {
    const { data, error } = await supabase
      .from('quotes')
      .insert({ enquiry_id: enquiryId, purchaser_id: purchaserId, supplier_response_id: responseId, supplier_price: supplierPrice, quoted_price: quotedPrice, message })
      .select()
      .single()
    if (error) throw error

    await supabase.from('enquiries').update({ status: 'quoted' }).eq('id', enquiryId)
    await fetchQuotes()
    return data
  }

  return { quotes, loading, refetch: fetchQuotes, sendQuote }
}
