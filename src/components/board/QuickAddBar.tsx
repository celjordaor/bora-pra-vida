import { useState, type FormEvent } from 'react'
import { parseQuickAdd, type ParsedQuickAdd } from '@/lib/natural-language-date'
import { MicButton } from '@/components/ui/MicButton'

interface Props {
  onCreate: (input: ParsedQuickAdd) => void
}

export function QuickAddBar({ onCreate }: Props) {
  const [text, setText] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onCreate(parseQuickAdd(trimmed))
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <div className="flex-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-navy-600">
        <input
          placeholder='Digite ou dite: "Reunião amanhã 15h"'
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 text-sm outline-none"
        />
        <MicButton onResult={(t) => setText(t)} />
      </div>
      <button
        type="submit"
        className="bg-navy-600 hover:bg-navy-950 transition-colors text-white text-sm rounded-lg px-4 py-2 font-medium shrink-0"
      >
        Adicionar
      </button>
    </form>
  )
}
