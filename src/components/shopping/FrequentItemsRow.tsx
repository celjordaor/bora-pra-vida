import type { FrequentItem } from '@/types/shopping'

interface Props {
  items: FrequentItem[]
  pendingNames: Set<string>
  onAdd: (item: FrequentItem) => void
}

export function FrequentItemsRow({ items, pendingNames, onAdd }: Props) {
  const visible = items.filter((i) => !pendingNames.has(i.name.trim().toLowerCase()))
  if (visible.length === 0) return null

  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 mb-1">Itens frequentes</p>
      <div className="flex flex-wrap gap-2">
        {visible.map((item) => (
          <button
            key={item.id}
            onClick={() => onAdd(item)}
            className="text-xs rounded-full px-3 py-1 border border-gray-200 text-gray-600 hover:border-navy-600 hover:text-navy-600 transition-colors"
          >
            + {item.name}
          </button>
        ))}
      </div>
    </div>
  )
}
