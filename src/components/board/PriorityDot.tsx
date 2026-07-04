import type { ActivityPriority } from '@/types/activity'

const COLORS: Record<ActivityPriority, string> = {
  low: 'bg-gray-300',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
}

const LABELS: Record<ActivityPriority, string> = {
  low: 'Prioridade baixa',
  medium: 'Prioridade média',
  high: 'Prioridade alta',
}

export function PriorityDot({ priority }: { priority: ActivityPriority }) {
  return (
    <span
      title={LABELS[priority]}
      className={`mt-1 h-2 w-2 rounded-full shrink-0 ${COLORS[priority]}`}
    />
  )
}
