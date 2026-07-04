import { useCallback, useEffect, useState } from 'react'
import {
  fetchShoppingItems,
  fetchFrequentItems,
  addShoppingItem,
  setItemChecked,
  deleteShoppingItem,
  clearCheckedItems,
  type AddItemInput,
} from '@/lib/shopping'
import { toast } from '@/lib/toast'
import type { ShoppingItem, FrequentItem } from '@/types/shopping'

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [frequentItems, setFrequentItems] = useState<FrequentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const [i, f] = await Promise.all([fetchShoppingItems(), fetchFrequentItems()])
      setItems(i)
      setFrequentItems(f)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar a lista')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addItem(input: AddItemInput) {
    try {
      const result = await addShoppingItem(items, input)
      if (result.merged) {
        toast.info(`"${input.name}" já estava na lista — quantidade atualizada.`)
      }
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar item')
    }
  }

  async function toggleItem(id: string, checked: boolean) {
    const item = items.find((i) => i.id === id)
    if (!item) return

    const previous = items
    // atualização otimista simples; se houver fusão, o refresh() logo depois
    // corrige a lista com o resultado real do servidor
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked } : i)))

    try {
      const result = await setItemChecked(items, item, checked)
      if (result.merged) {
        toast.info(`"${item.name}" já estava pendente — quantidade atualizada.`)
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item')
      setItems(previous)
    }
  }

  async function removeItem(id: string) {
    const previous = items
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      await deleteShoppingItem(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir item')
      setItems(previous)
    }
  }

  async function clearChecked() {
    const checkedIds = items.filter((i) => i.checked).map((i) => i.id)
    if (checkedIds.length === 0) return

    const previous = items
    setItems((prev) => prev.filter((i) => !i.checked))
    try {
      await clearCheckedItems(checkedIds)
      toast.success('Itens concluídos removidos.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao limpar concluídos')
      setItems(previous)
    }
  }

  return {
    items,
    frequentItems,
    loading,
    error,
    addItem,
    toggleItem,
    removeItem,
    clearChecked,
    refresh,
  }
}
