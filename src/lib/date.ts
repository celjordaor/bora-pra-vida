import type { ActivityStatus } from '@/types/activity'

export type DateChipVariant = 'today' | 'upcoming' | 'overdue' | 'future'

export interface DateChipInfo {
  label: string
  variant: DateChipVariant
}

export function getDateChipInfo(
  dueDate: string | null,
  status: ActivityStatus
): DateChipInfo | null {
  if (!dueDate) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const date = new Date(`${dueDate}T00:00:00`)
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000)

  if (diffDays === 0) return { label: 'Hoje', variant: 'today' }
  if (diffDays === 1) return { label: 'Amanhã', variant: 'upcoming' }

  const formatted = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })

  if (diffDays < 0 && status !== 'done') {
    return { label: formatted, variant: 'overdue' }
  }
  return { label: formatted, variant: 'future' }
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function tomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}
