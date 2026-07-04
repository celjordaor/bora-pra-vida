import { useCallback, useEffect, useState } from 'react'
import { fetchNotes, createNote, deleteNote, convertNoteToActivity } from '@/lib/notes'
import { toast } from '@/lib/toast'
import { isOfflineError } from '@/lib/offline-sync'
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

  // Quando a conexão volta, recarrega as notas pra buscar o que foi
  // sincronizado em segundo plano pelo service worker.
  useEffect(() => {
    window.addEventListener('bora-pra-vida:sync', refresh)
    return () => window.removeEventListener('bora-pra-vida:sync', refresh)
  }, [refresh])

  async function addNote(content: string) {
    try {
      const created = await createNote(content)
      setNotes((prev) => [created, ...prev])
    } catch (err) {
      if (isOfflineError(err)) {
        // Já foi guardada pelo service worker pra reenviar depois — mostra
        // uma versão local provisória em vez de tratar como erro.
        setNotes((prev) => [
          {
            id: `offline-${Date.now()}`,
            user_id: '',
            content,
            photo_url: null,
            converted_to_activity_id: null,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ])
        toast.info('Sem conexão — a nota foi salva e será sincronizada sozinha.')
        return
      }
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
      setNotes((prev) => prev.filter((n) => n.id !== note.id))
      toast.success('Nota convertida em atividade — confira em "Hoje".')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao converter nota')
    }
  }

  return { notes, loading, error, addNote, removeNote, convertNote }
}
