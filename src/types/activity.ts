export type ActivityStatus = 'todo' | 'doing' | 'done'
export type ActivityPriority = 'low' | 'medium' | 'high'

export interface Subtask {
  id: string
  activity_id: string
  title: string
  done: boolean
  sort_order: number
}

export interface Activity {
  id: string
  user_id: string
  space_id: string | null
  title: string
  description: string | null
  status: ActivityStatus
  priority: ActivityPriority
  due_date: string | null // 'YYYY-MM-DD'
  due_time: string | null // 'HH:MM:SS'
  completed_at: string | null
  created_at: string
  subtasks?: Subtask[]
}

export interface Space {
  id: string
  name: string
  kind: string
  sort_order: number
}
