import { supabase } from './supabase'
import { computeNextDueDate } from './recurrence'
import type { Activity, ActivityStatus, RecurrenceRule } from '@/types/activity'

export async function fetchActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*, activity_subtasks(*)')
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    ...row,
    subtasks: (row.activity_subtasks ?? []).sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    ),
  }))
}

export interface ActivityInput {
  title: string
  description: string | null
  space_id: string | null
  priority: Activity['priority']
  due_date: string | null
  due_time: string | null
  recurrence_rule: RecurrenceRule | null
  /** true quando a atividade nasceu da conversão de uma nota rápida */
  from_note?: boolean
}

export async function createActivity(input: ActivityInput): Promise<Activity> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) throw new Error('Sessão expirada, faça login novamente.')

  const { data, error } = await supabase
    .from('activities')
    .insert({ ...input, user_id: userId, status: 'todo' })
    .select()
    .single()

  if (error) throw error
  return data as Activity
}

export async function updateActivity(
  id: string,
  patch: Partial<ActivityInput>
) {
  const { error } = await supabase.from('activities').update(patch).eq('id', id)
  if (error) throw error
}

export async function updateActivityStatus(id: string, status: ActivityStatus) {
  const patch: Record<string, unknown> = {
    status,
    completed_at: status === 'done' ? new Date().toISOString() : null,
  }
  const { error } = await supabase.from('activities').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteActivity(id: string) {
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw error
}

/**
 * Se a atividade tiver uma regra de recorrência e uma data definida, cria
 * automaticamente a próxima ocorrência (mesmo título, espaço, prioridade e
 * subtarefas — mas "zeradas" — com a data calculada a partir da regra).
 * Retorna a nova atividade criada, ou null se não havia recorrência a aplicar.
 */
export async function generateNextOccurrence(
  activity: Activity
): Promise<Activity | null> {
  if (!activity.recurrence_rule || activity.recurrence_rule.type === 'none') {
    return null
  }
  if (!activity.due_date) return null

  const nextDate = computeNextDueDate(activity.recurrence_rule, activity.due_date)
  if (!nextDate) return null

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) return null

  const { data: created, error } = await supabase
    .from('activities')
    .insert({
      user_id: userId,
      space_id: activity.space_id,
      title: activity.title,
      description: activity.description,
      status: 'todo',
      priority: activity.priority,
      due_date: nextDate,
      due_time: activity.due_time,
      recurrence_rule: activity.recurrence_rule,
      recurrence_parent_id: activity.recurrence_parent_id ?? activity.id,
    })
    .select()
    .single()

  if (error) throw error

  const subtasks = activity.subtasks ?? []
  for (const [i, s] of subtasks.entries()) {
    await addSubtask(created.id, s.title, i, false)
  }

  return created as Activity
}

export async function addSubtask(
  activityId: string,
  title: string,
  sortOrder: number,
  done = false
) {
  const { data, error } = await supabase
    .from('activity_subtasks')
    .insert({ activity_id: activityId, title, sort_order: sortOrder, done })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleSubtask(id: string, done: boolean) {
  const { error } = await supabase
    .from('activity_subtasks')
    .update({ done })
    .eq('id', id)
  if (error) throw error
}

export async function deleteSubtask(id: string) {
  const { error } = await supabase.from('activity_subtasks').delete().eq('id', id)
  if (error) throw error
}

const STATUS_ORDER: ActivityStatus[] = ['todo', 'doing', 'done']

export function nextStatus(status: ActivityStatus): ActivityStatus {
  const i = STATUS_ORDER.indexOf(status)
  return STATUS_ORDER[Math.min(i + 1, STATUS_ORDER.length - 1)]
}

export function prevStatus(status: ActivityStatus): ActivityStatus {
  const i = STATUS_ORDER.indexOf(status)
  return STATUS_ORDER[Math.max(i - 1, 0)]
}
