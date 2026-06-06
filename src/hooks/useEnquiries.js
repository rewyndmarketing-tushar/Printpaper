import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useEnquiries({ role, userId } = {}) {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  async function fetchEnquiries() {
    setLoading(true)
    let query = supabase
      .from('enquiries')
      .select('*, profiles(name, email)')
      .order('created_at', { ascending: false })

    // Purchaser: only their own enquiries
    if (role === 'purchaser' && userId) {
      query = query.eq('purchaser_id', userId)
    }
    // Supplier & Admin: all enquiries (RLS handles visibility)

    const { data, error } = await query
    if (error) setError(error.message)
    else setEnquiries(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchEnquiries()

    // Realtime subscription
    const channel = supabase
      .channel('enquiries-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiries' }, fetchEnquiries)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [role, userId])

  async function createEnquiry(form) {
    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        purchaser_id: userId,
        paper_type:   form.paperType,
        gsm:          form.gsm,
        coating:      form.coating,
        shade:        form.shade,
        quantity:     Number(form.quantity),
        unit:         form.unit,
        sheet_size:   form.sheetSize,
        grain_spec:   form.grainSpec,
        notes:        form.notes,
        status:       'open',
      })
      .select()
      .single()
    if (error) throw error
    await fetchEnquiries()
    return data
  }

  return { enquiries, loading, error, refetch: fetchEnquiries, createEnquiry }
}
