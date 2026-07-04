import { supabase } from './supabase'
import { createActivity } from './activities'
import type { QuickNote } from '@/types/note'

export async function fetchNotes(): Promise<QuickNote[]> {
  const { data, error } = await supabase
    .from('quick_notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createNote(content: string): Promise<QuickNote> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) throw new Error('Sessão expirada, faça login novamente.')

  const { data, error } = await supabase
    .from('quick_notes')
    .insert({ user_id: userId, content })
    .select()
    .single()

  if (error) throw error
  return data as QuickNote
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from('quick_notes').delete().eq('id', id)
  if (error) throw error
}

async function markNoteConverted(id: string, activityId: string) {
  const { error } = await supabase
    .from('quick_notes')
    .update({ converted_to_activity_id: activityId })
    .eq('id', id)
  if (error) throw error
}

/** Cria uma atividade a partir do conteúdo da nota (título = primeira linha,
 * descrição = texto completo) e marca a nota como convertida. */
export async function convertNoteToActivity(note: QuickNote) {
  const firstLine = note.content.split('\n')[0].trim()
  const title = firstLine.slice(0, 80) || 'Nova atividade'

  const activity = await createActivity({
    title,
    description: note.content,
    space_id: null,
    priority: 'medium',
    due_date: null,
    due_time: null,
    recurrence_rule: null,
  })

  await markNoteConverted(note.id, activity.id)
  return activity
}
