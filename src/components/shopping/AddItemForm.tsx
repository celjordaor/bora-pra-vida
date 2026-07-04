import { useState, type FormEvent } from 'react'
import { suggestCategory, CATEGORY_ORDER, CATEGORY_LABELS } from '@/lib/shopping-categories'
import { parseSpokenItems } from '@/lib/shopping-voice-parser'
import { MicButton } from '@/components/ui/MicButton'
import { toast } from '@/lib/toast'

interface Props {
  onAdd: (input: { name: string; quantity: string | null; category: string }) => void
}

export function AddItemForm({ onAdd }: Props) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('auto')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    const finalCategory = category === 'auto' ? suggestCategory(trimmed) : category
    onAdd({ name: trimmed, quantity: quantity.trim() || null, category: finalCategory })

    setName('')
    setQuantity('')
    setCategory('auto')
  }

  function handleVoiceResult(transcript: string) {
    const items = parseSpokenItems(transcript)
    if (items.length === 0) return

    if (items.length === 1) {
      // um item só: preenche o campo pra você revisar antes de adicionar
      setName(items[0])
      return
    }

    // frase com vários itens ("leite, pão e ovos"): adiciona todos direto
    for (const itemName of items) {
      onAdd({ name: itemName, quantity: null, category: suggestCategory(itemName) })
    }
    toast.success(`${items.length} itens adicionados por voz.`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
      <div className="flex-1 min-w-[160px] flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-navy-600">
        <input
          placeholder="Adicionar item… (ex: leite, tomate)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 text-sm outline-none"
        />
        <MicButton onResult={handleVoiceResult} />
      </div>
      <input
        placeholder="Qtd (opcional)"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-600"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
      >
        <option value="auto">Categoria automática</option>
        {CATEGORY_ORDER.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-navy-600 hover:bg-navy-950 transition-colors text-white text-sm rounded-lg px-4 py-2 font-medium"
      >
        Adicionar
      </button>
    </form>
  )
}
