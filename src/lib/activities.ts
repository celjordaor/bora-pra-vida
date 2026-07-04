import { supabase } from './supabase'
import type { Activity, ActivityStatus, Space } from '@/types/activity'

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

export async function fetchSpaces(): Promise<Space[]> {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .order('sort_order')

  if (error) throw error
  return data ?? []
}

export interface ActivityInput {
  title: string
  description: string | null
  space_id: string | null
  priority: Activity['priority']
  due_date: string | null
  due_time: string | null
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
