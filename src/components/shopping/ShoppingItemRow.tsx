import type { ShoppingItem } from '@/types/shopping'
import { SwipeableRow } from '@/components/ui/SwipeableRow'

interface Props {
  item: ShoppingItem
  onToggle: (checked: boolean) => void
  onDelete: () => void
}

export function ShoppingItemRow({ item, onToggle, onDelete }: Props) {
  return (
    <SwipeableRow
      onSwipeRight={() => onToggle(!item.checked)}
      onSwipeLeft={onDelete}
      rightLabel={item.checked ? '↩ Reabrir' : '✓ Concluir'}
    >
      <div className="flex items-center gap-2 py-1.5 group">
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
        {item.quantity && <span className="text-xs text-gray-400">{item.quantity}</span>}
        <button
          onClick={onDelete}
          className="text-gray-300 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
    </SwipeableRow>
  )
}
