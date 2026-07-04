import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useShoppingList } from '@/hooks/useShoppingList'
import { useNotes } from '@/hooks/useNotes'

export const Route = createFileRoute('/quick')({
  component: QuickCapturePage,
})

type Tab = 'compras' | 'nota'

function QuickCapturePage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('compras')

  useEffect(() => {
    if (!loading && !session) navigate({ to: '/auth' })
  }, [loading, session, navigate])

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-navy-600 text-sm">
        Carregando…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <header className="bg-navy-950 text-white px-3 py-2 flex items-center gap-2 text-sm shrink-0">
        <span className="font-semibold">Bora pra Vida</span>
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setTab('compras')}
            className={`px-2 py-1 rounded transition-colors ${
              tab === 'compras' ? 'bg-navy-800' : 'hover:bg-navy-800'
            }`}
          >
            Compras
          </button>
          <button
            onClick={() => setTab('nota')}
            className={`px-2 py-1 rounded transition-colors ${
              tab === 'nota' ? 'bg-navy-800' : 'hover:bg-navy-800'
            }`}
          >
            Nota
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-3">
        {tab === 'compras' ? <QuickShoppingList /> : <QuickNoteCapture />}
      </main>
    </div>
  )
}

function QuickShoppingList() {
  const { items, loading, toggleItem } = useShoppingList()
  const pending = items.filter((i) => !i.checked)

  if (loading) return <p className="text-sm text-gray-500">Carregando…</p>
  if (pending.length === 0) {
    return <p className="text-sm text-gray-400">Lista vazia 🎉</p>
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {pending.map((item) => (
        <label
          key={item.id}
          className="flex items-center gap-2 py-2 text-sm cursor-pointer"
        >
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(e) => toggleItem(item.id, e.target.checked)}
            className="accent-navy-600 h-4 w-4 shrink-0"
          />
          <span className="flex-1 text-navy-950">{item.name}</span>
          {item.quantity && (
            <span className="text-xs text-gray-400">{item.quantity}</span>
          )}
        </label>
      ))}
    </div>
  )
}

function QuickNoteCapture() {
  const { addNote } = useNotes()
  const [content, setContent] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    addNote(trimmed)
    setContent('')
    setSent(true)
    setTimeout(() => setSent(false), 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        autoFocus
        placeholder="Anotar algo rápido…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-600 resize-y"
      />
      <button
        type="submit"
        className="self-start bg-navy-600 hover:bg-navy-950 transition-colors text-white text-sm rounded-lg px-4 py-2 font-medium"
      >
        Salvar nota
      </button>
      {sent && <p className="text-xs text-positive">Nota salva ✓</p>}
    </form>
  )
}
