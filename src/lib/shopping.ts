import { supabase } from './supabase'
import type { ShoppingItem, FrequentItem } from '@/types/shopping'

export async function fetchShoppingItems(): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchFrequentItems(): Promise<FrequentItem[]> {
  const { data, error } = await supabase
    .from('frequent_items')
    .select('*')
    .order('use_count', { ascending: false })
    .order('last_used_at', { ascending: false })
    .limit(12)

  if (error) throw error
  return data ?? []
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

/** Soma quantidades numéricas (ex.: "2" + "3" = "5"). Se não der pra somar
 * (texto livre, tipo "1 pacote grande"), mantém a informação mais completa. */
function mergeQuantity(oldQty: string | null, newQty: string | null): string | null {
  const oldNum = oldQty ? parseFloat(oldQty.replace(',', '.')) : NaN
  const newNum = newQty ? parseFloat(newQty.replace(',', '.')) : NaN

  if (!Number.isNaN(oldNum) && !Number.isNaN(newNum)) {
    const total = oldNum + newNum
    return Number.isInteger(total) ? String(total) : total.toFixed(2)
  }
  return oldQty || newQty || null
}

export interface AddItemInput {
  name: string
  quantity: string | null
  category: string
  space_id: string | null
}

export interface AddItemResult {
  merged: boolean
}

/** Adiciona um item. Se já existir um item igual (mesmo nome, ainda não
 * marcado) na lista, funde as quantidades em vez de duplicar. */
export async function addShoppingItem(
  existingItems: ShoppingItem[],
  input: AddItemInput
): Promise<AddItemResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) throw new Error('Sessão expirada, faça login novamente.')

  const normalized = normalizeName(input.name)
  const existing = existingItems.find(
    (i) => !i.checked && normalizeName(i.name) === normalized
  )

  if (existing) {
    const mergedQty = mergeQuantity(existing.quantity, input.quantity)
    const { error } = await supabase
      .from('shopping_items')
      .update({ quantity: mergedQty })
      .eq('id', existing.id)
    if (error) throw error

    await touchFrequentItem(userId, input.name, input.category)
    return { merged: true }
  }

  const { error } = await supabase.from('shopping_items').insert({
    user_id: userId,
    space_id: input.space_id,
    name: input.name.trim(),
    quantity: input.quantity,
    category: input.category,
  })
  if (error) throw error

  await touchFrequentItem(userId, input.name, input.category)
  return { merged: false }
}

async function touchFrequentItem(userId: string, name: string, category: string) {
  const trimmed = name.trim()

  const { data: existing, error: findError } = await supabase
    .from('frequent_items')
    .select('id, use_count')
    .eq('user_id', userId)
    .eq('name', trimmed)
    .maybeSingle()

  if (findError) throw findError

  if (existing) {
    const { error } = await supabase
      .from('frequent_items')
      .update({
        use_count: existing.use_count + 1,
        last_used_at: new Date().toISOString(),
        category,
      })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('frequent_items').insert({
      user_id: userId,
      name: trimmed,
      category,
      use_count: 1,
    })
    if (error) throw error
  }
}

export async function toggleShoppingItem(id: string, checked: boolean) {
  const { error } = await supabase
    .from('shopping_items')
    .update({ checked })
    .eq('id', id)
  if (error) throw error
}

export async function deleteShoppingItem(id: string) {
  const { error } = await supabase.from('shopping_items').delete().eq('id', id)
  if (error) throw error
}

export async function clearCheckedItems(ids: string[]) {
  if (ids.length === 0) return
  const { error } = await supabase.from('shopping_items').delete().in('id', ids)
  if (error) throw error
}
