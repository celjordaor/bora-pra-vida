import { useCallback, useEffect, useState } from 'react'
import {
  fetchShoppingCategories,
  createShoppingCategory,
  updateShoppingCategory,
  deleteShoppingCategory,
} from '@/lib/shopping'
import { toast } from '@/lib/toast'
import type { ShoppingCategoryRecord } from '@/types/shopping'

export function useShoppingCategories() {
  const [categories, setCategories] = useState<ShoppingCategoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      setCategories(await fetchShoppingCategories())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    window.addEventListener('bora-pra-vida:sync', refresh)
    return () => window.removeEventListener('bora-pra-vida:sync', refresh)
  }, [refresh])

  async function addCategory(input: { name: string; color: string; icon: string | null }) {
    try {
      const created = await createShoppingCategory(input)
      setCategories((prev) => [...prev, created])
      toast.success('Categoria criada.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar categoria')
    }
  }

  async function editCategory(id: string, patch: Partial<ShoppingCategoryRecord>) {
    const previous = categories
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    try {
      await updateShoppingCategory(id, patch)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar categoria')
      setCategories(previous)
    }
  }

  async function removeCategory(id: string) {
    const target = categories.find((c) => c.id === id)
    const outros = categories.find((c) => c.id !== id && c.name.toLowerCase() === 'outros')
    const fallbackName = outros?.name ?? 'Outros'

    const previous = categories
    setCategories((prev) => prev.filter((c) => c.id !== id))
    try {
      await deleteShoppingCategory(id, fallbackName)
      toast.success(
        target
          ? `"${target.name}" excluída — itens movidos pra "${fallbackName}".`
          : 'Categoria excluída.'
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir categoria')
      setCategories(previous)
    }
  }

  return { categories, loading, error, addCategory, editCategory, removeCategory, refresh }
}
