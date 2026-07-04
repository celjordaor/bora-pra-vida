import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useShoppingList } from '@/hooks/useShoppingList'
import { useShoppingCategories } from '@/hooks/useShoppingCategories'
import { fetchSpaces } from '@/lib/spaces'
import { AddItemForm } from '@/components/shopping/AddItemForm'
import { FrequentItemsRow } from '@/components/shopping/FrequentItemsRow'
import { ShoppingItemRow } from '@/components/shopping/ShoppingItemRow'
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
  const { categories, loading: loadingCategories } = useShoppingCategories()

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

  const categoryByName = useMemo(
    () => new Map(categories.map((c) => [c.name, c])),
    [categories]
  )

  const grouped = useMemo(() => {
    const map = new Map<string, ShoppingItem[]>()
    for (const item of pending) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return map
  }, [pending])

  // Categorias ativas primeiro (na ordem configurada), depois qualquer
  // categoria "órfã" que ainda tenha itens (ex.: foi desativada)
  const orderedCategoryNames = useMemo(() => {
    const active = categories.filter((c) => c.active).map((c) => c.name)
    const extra = [...grouped.keys()].filter((name) => !active.includes(name))
    return [...active, ...extra]
  }, [categories, grouped])

  const pendingNames = new Set(pending.map((i) => i.name.trim().toLowerCase()))

  function handleAdd(input: { name: string; quantity: string | null; category: string }) {
    addItem({ ...input, space_id: shoppingSpaceId })
  }

  function handleAddFrequent(freq: FrequentItem) {
    addItem({
      name: freq.name,
      quantity: null,
      category: freq.category,
      space_id: shoppingSpaceId,
    })
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl bg-gradient-to-br from-navy-950 to-navy-600 text-white p-5 mb-6">
        <h2 className="text-xl font-semibold">🛒 Compras</h2>
        <p className="text-navy-200 text-sm mt-1">
          {pending.length === 0
            ? 'Nada pendente por aqui.'
            : `${pending.length} item(ns) pendente(s)`}
        </p>
      </div>

      <AddItemForm categories={categories} onAdd={handleAdd} />
      <FrequentItemsRow
        items={frequentItems}
        pendingNames={pendingNames}
        onAdd={handleAddFrequent}
      />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading || loadingCategories ? (
        <p className="text-gray-500">Carregando…</p>
      ) : pending.length === 0 && checked.length === 0 ? (
        <p className="text-gray-400 text-sm">
          Sua lista está vazia 🛒 — adicione o primeiro item acima.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {orderedCategoryNames.map((categoryName) => {
            const categoryItems = grouped.get(categoryName) ?? []
            if (categoryItems.length === 0) return null
            const category = categoryByName.get(categoryName)
            return (
              <div key={categoryName}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: category?.color ?? '#94a3b8' }}
                  />
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {category?.icon ? `${category.icon} ` : ''}
                    {categoryName}
                  </h3>
                </div>
                <div className="bg-white rounded-lg ring-1 ring-black/5 px-3 divide-y divide-gray-100">
                  {categoryItems.map((item) => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      category={category}
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
              <div className="flex items-center justify-between mb-1 px-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
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
                    category={categoryByName.get(item.category)}
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
