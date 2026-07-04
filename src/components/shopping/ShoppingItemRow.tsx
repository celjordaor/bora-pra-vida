import type { ShoppingItem, ShoppingCategoryRecord } from '@/types/shopping'
import { SwipeableRow } from '@/components/ui/SwipeableRow'
import { CategoryPill } from './CategoryPill'

interface Props {
  item: ShoppingItem
  category?: ShoppingCategoryRecord
  onToggle: (checked: boolean) => void
  onDelete: () => void
}

export function ShoppingItemRow({ item, category, onToggle, onDelete }: Props) {
  return (
    <SwipeableRow
      onSwipeRight={() => onToggle(!item.checked)}
      onSwipeLeft={onDelete}
      rightLabel={item.checked ? '↩ Reabrir' : '✓ Concluir'}
    >
      <div className="flex items-center gap-2 py-2 group">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={(e) => onToggle(e.target.checked)}
          className="accent-navy-600 h-4 w-4 shrink-0"
        />
        <span
          className={`flex-1 text-sm ${
            item.checked ? 'line-through text-gray-400' : 'text-navy-950'
          }`}
        >
          {item.name}
        </span>
        {category && (
          <CategoryPill name={category.name} color={category.color} icon={category.icon} />
        )}
        {item.quantity && <span className="text-xs text-gray-400">{item.quantity}</span>}
        <button
          onClick={onDelete}
          title="Excluir"
          className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          🗑️
        </button>
      </div>
    </SwipeableRow>
  )
}
