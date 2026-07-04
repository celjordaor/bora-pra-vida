import { useCallback, useEffect, useState } from 'react'
import { fetchNotes, createNote, deleteNote, convertNoteToActivity } from '@/lib/notes'
import { toast } from '@/lib/toast'
import type { QuickNote } from '@/types/note'

export function useNotes() {
  const [notes, setNotes] = useState<QuickNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      setNotes(await fetchNotes())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar notas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addNote(content: string) {
    try {
      const created = await createNote(content)
      setNotes((prev) => [created, ...prev])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar nota')
    }
  }

  async function removeNote(id: string) {
    const previous = notes
    setNotes((prev) => prev.filter((n) => n.id !== id))
    try {
      await deleteNote(id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir nota')
      setNotes(previous)
    }
  }

  async function convertNote(note: QuickNote) {
    try {
      await convertNoteToActivity(note)
      toast.success('Nota convertida em atividade — confira em "Hoje".')
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao converter nota')
    }
  }

  return { notes, loading, error, addNote, removeNote, convertNote }
}
