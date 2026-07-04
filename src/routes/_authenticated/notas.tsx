import { createFileRoute } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { useNotes } from '@/hooks/useNotes'
import { NoteCard } from '@/components/notes/NoteCard'
import { useConfirm } from '@/components/ui/ConfirmDialogProvider'
import { MicButton } from '@/components/ui/MicButton'
import type { QuickNote } from '@/types/note'

export const Route = createFileRoute('/_authenticated/notas')({
  component: NotesPage,
})

function NotesPage() {
  const { notes, loading, error, addNote, removeNote, convertNote } = useNotes()
  const [content, setContent] = useState('')
  const confirmDialog = useConfirm()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    addNote(trimmed)
    setContent('')
  }

  async function handleDelete(id: string) {
    const ok = await confirmDialog({
      title: 'Excluir nota',
      message: 'Tem certeza que quer excluir essa nota?',
      confirmLabel: 'Excluir',
      variant: 'danger',
    })
    if (ok) removeNote(id)
  }

  async function handleConvert(note: QuickNote) {
    const ok = await confirmDialog({
      title: 'Converter em tarefa',
      message:
        'A nota vai virar uma atividade em "Hoje" e a nota original será excluída. Quer continuar?',
      confirmLabel: 'Converter',
    })
    if (ok) convertNote(note)
  }

  function handleVoiceResult(transcript: string) {
    setContent((prev) => (prev ? `${prev} ${transcript}` : transcript))
  }

  return (
    <div className="max-w-3xl">
      <div className="rounded-xl bg-gradient-to-br from-navy-950 to-navy-600 text-white p-5 mb-6">
        <h2 className="text-xl font-semibold">📝 Notas</h2>
        <p className="text-navy-200 text-sm mt-1">
          {notes.length === 0 ? 'Nenhuma nota ainda.' : `${notes.length} nota(s)`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <div className="flex items-start gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-navy-600">
          <textarea
            placeholder="Anotar algo rápido…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="flex-1 text-sm outline-none resize-y min-h-[64px]"
          />
          <MicButton onResult={handleVoiceResult} className="mt-1" />
        </div>
        <button
          type="submit"
          className="self-start bg-navy-600 hover:bg-navy-950 transition-colors text-white text-sm rounded-lg px-4 py-2 font-medium"
        >
          Adicionar nota
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Carregando…</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-400 text-sm">
          Nenhuma nota ainda 📝 — escreva algo rápido acima.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onConvert={() => handleConvert(note)}
              onDelete={() => handleDelete(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
