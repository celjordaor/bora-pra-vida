import { useState, type FormEvent } from 'react'
import { useShoppingCategories } from '@/hooks/useShoppingCategories'
import { useConfirm } from '@/components/ui/ConfirmDialogProvider'
import type { ShoppingCategoryRecord } from '@/types/shopping'

const COLOR_PRESETS = [
  '#22c55e',
  '#ef4444',
  '#f59e0b',
  '#3b82f6',
  '#a855f7',
  '#06b6d4',
  '#14b8a6',
  '#ec4899',
  '#94a3b8',
  '#eab308',
]

export function ShoppingCategoriesManager() {
  const { categories, loading, addCategory, editCategory, removeCategory } =
    useShoppingCategories()
  const confirmDialog = useConfirm()

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    addCategory({ name: trimmed, color: newColor, icon: null })
    setNewName('')
    setNewColor(COLOR_PRESETS[0])
  }

  function startEdit(cat: ShoppingCategoryRecord) {
    setEditingId(cat.id)
    setEditingName(cat.name)
  }

  function saveEdit(cat: ShoppingCategoryRecord) {
    const trimmed = editingName.trim()
    if (trimmed && trimmed !== cat.name) {
      editCategory(cat.id, { name: trimmed })
    }
    setEditingId(null)
  }

  async function handleDelete(cat: ShoppingCategoryRecord) {
    const ok = await confirmDialog({
      title: 'Excluir categoria',
      message: `Os itens que estão em "${cat.name}" serão movidos pra "Outros". Quer continuar?`,
      confirmLabel: 'Excluir',
      variant: 'danger',
    })
    if (ok) removeCategory(cat.id)
  }

  if (loading) return <p className="text-sm text-gray-500">Carregando…</p>

  return (
    <div className="flex flex-col gap-1">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-3 py-1.5">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: cat.color }}
          />

          {editingId === cat.id ? (
            <input
              autoFocus
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => saveEdit(cat)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat)}
              className="flex-1 text-sm rounded border border-gray-200 px-2 py-1 outline-none focus:ring-2 focus:ring-navy-600"
            />
          ) : (
            <span
              className={`flex-1 text-sm ${cat.active ? 'text-navy-950' : 'text-gray-400 line-through'}`}
            >
              {cat.icon ? `${cat.icon} ` : ''}
              {cat.name}
            </span>
          )}

          <button
            onClick={() => editCategory(cat.id, { active: !cat.active })}
            title={cat.active ? 'Desativar categoria' : 'Ativar categoria'}
            className="text-gray-400 hover:text-navy-600 text-sm"
          >
            {cat.active ? '👁️' : '🚫'}
          </button>
          <button
            onClick={() => startEdit(cat)}
            title="Renomear"
            className="text-gray-400 hover:text-navy-600 text-sm"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(cat)}
            title="Excluir"
            className="text-gray-400 hover:text-red-600 text-sm"
          >
            🗑️
          </button>
        </div>
      ))}

      <form
        onSubmit={handleAdd}
        className="flex items-center gap-2 pt-3 mt-2 border-t border-gray-100"
      >
        <input
          placeholder="Nova categoria…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-1.5 outline-none focus:ring-2 focus:ring-navy-600"
        />
        <div className="flex gap-1">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setNewColor(c)}
              title={c}
              className={`h-5 w-5 rounded-full border-2 transition-colors ${
                newColor === c ? 'border-navy-950' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button
          type="submit"
          className="bg-navy-600 hover:bg-navy-950 transition-colors text-white text-sm rounded-lg px-3 py-1.5 font-medium shrink-0"
        >
          Adicionar
        </button>
      </form>
    </div>
  )
}
