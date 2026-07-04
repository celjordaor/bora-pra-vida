import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useShoppingList } from '@/hooks/useShoppingList'
import { fetchSpaces } from '@/lib/spaces'
import { AddItemForm } from '@/components/shopping/AddItemForm'
import { FrequentItemsRow } from '@/components/shopping/FrequentItemsRow'
import { ShoppingItemRow } from '@/components/shopping/ShoppingItemRow'
import { CATEGORY_ORDER, CATEGORY_LABELS } from '@/lib/shopping-categories'
import type { ShoppingItem, FrequentItem } from '@/types/shopping'

export const Route = createFileRoute('/_authenticated/compras')({
  component: ShoppingPage,
})

function ShoppingPage() {
  const {
    items,
    frequentItems,
    loading,
    error,
    addItem,
    toggleItem,
    removeItem,
    clearChecked,
  } = useShoppingList()

  // Descobre o id do espaço "Compras" pra já vincular os itens a ele
  const [shoppingSpaceId, setShoppingSpaceId] = useState<string | null>(null)
  useEffect(() => {
    fetchSpaces().then((spaces) => {
      const shoppingSpace = spaces.find((s) => s.kind === 'shopping')
      setShoppingSpaceId(shoppingSpace?.id ?? null)
    })
  }, [])

  const pending = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)

  const grouped = useMemo(() => {
    const map = new Map<string, ShoppingItem[]>()
    for (const category of CATEGORY_ORDER) map.set(category, [])
    for (const item of pending) {
      const list = map.get(item.category) ?? map.get('outros')!
      list.push(item)
    }
    return map
  }, [pending])

  const pendingNames = new Set(pending.map((i) => i.name.trim().toLowerCase()))

  function handleAdd(input: { name: string; quantity: string | null; category: string }) {
    addItem({ ...input, space_id: shoppingSpaceId })
  }

  function handleAddFrequent(freq: FrequentItem) {
    addItem({ name: freq.name, quantity: null, category: freq.category, space_id: shoppingSpaceId })
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold text-navy-950 mb-4">Compras</h2>

      <AddItemForm onAdd={handleAdd} />
      <FrequentItemsRow
        items={frequentItems}
        pendingNames={pendingNames}
        onAdd={handleAddFrequent}
      />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Carregando…</p>
      ) : pending.length === 0 && checked.length === 0 ? (
        <p className="text-gray-400 text-sm">Sua lista está vazia.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {CATEGORY_ORDER.map((category) => {
            const categoryItems = grouped.get(category) ?? []
            if (categoryItems.length === 0) return null
            return (
              <div key={category}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="bg-white rounded-lg ring-1 ring-black/5 px-3 divide-y divide-gray-100">
                  {categoryItems.map((item) => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      onToggle={(checked) => toggleItem(item.id, checked)}
                      onDelete={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {checked.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Concluídos ({checked.length})
                </h3>
                <button
                  onClick={clearChecked}
                  className="text-xs text-navy-600 hover:text-navy-950"
                >
                  Limpar concluídos
                </button>
              </div>
              <div className="bg-white rounded-lg ring-1 ring-black/5 px-3 divide-y divide-gray-100">
                {checked.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    onToggle={(checked) => toggleItem(item.id, checked)}
                    onDelete={() => removeItem(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
