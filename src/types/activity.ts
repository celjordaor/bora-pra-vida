export type ActivityStatus = 'todo' | 'doing' | 'done'
export type ActivityPriority = 'low' | 'medium' | 'high'

export type RecurrenceType =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'monthly'
  | 'custom'

export interface RecurrenceRule {
  type: RecurrenceType
  /** 0=Dom, 1=Seg, …, 6=Sáb — usado só quando type === 'weekdays' */
  days?: number[]
  /** usado só quando type === 'custom' */
  intervalDays?: number
}

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
  recurrence_rule: RecurrenceRule | null
  recurrence_parent_id: string | null
  from_note: boolean
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
