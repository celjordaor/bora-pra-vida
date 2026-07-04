import type { ActivityPriority } from '@/types/activity'

const STYLES: Record<ActivityPriority, string> = {
  low: 'bg-gray-100 text-gray-500',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
}

const LABELS: Record<ActivityPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
}

export function PriorityDot({ priority }: { priority: ActivityPriority }) {
  return (
    <span
      title={`Prioridade ${LABELS[priority].toLowerCase()}`}
      className={`text-[10px] font-medium rounded-full px-1.5 py-0.5 shrink-0 ${STYLES[priority]}`}
    >
      {LABELS[priority]}
    </span>
  )
}
