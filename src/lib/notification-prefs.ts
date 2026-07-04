import { supabase } from './supabase'

export interface NotificationPrefs {
  user_id: string
  task_reminders_enabled: boolean
  morning_summary_enabled: boolean
  end_of_day_enabled: boolean
  send_hour: number
}

export async function fetchNotificationPrefs(): Promise<NotificationPrefs | null> {
  const { data, error } = await supabase.from('notification_prefs').select('*').maybeSingle()
  if (error) throw error
  return data
}

export async function updateNotificationPrefs(
  patch: Partial<Omit<NotificationPrefs, 'user_id'>>
) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const userId = sessionData.session?.user.id
  if (!userId) throw new Error('Sessão expirada, faça login novamente.')

  const { error } = await supabase
    .from('notification_prefs')
    .update(patch)
    .eq('user_id', userId)
  if (error) throw error
}
