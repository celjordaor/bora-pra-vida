import { supabase } from './supabase'
import type { Space } from '@/types/activity'

export async function fetchSpaces(): Promise<Space[]> {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .order('sort_order')

  if (error) throw error
  return data ?? []
}
