export interface ShoppingItem {
  id: string
  user_id: string
  space_id: string | null
  name: string
  quantity: string | null
  category: string
  checked: boolean
  created_at: string
}

export interface ShoppingCategoryRecord {
  id: string
  user_id: string
  name: string
  color: string
  icon: string | null
  sort_order: number
  active: boolean
}

export interface FrequentItem {
  id: string
  user_id: string
  name: string
  category: string
  use_count: number
  last_used_at: string
}
