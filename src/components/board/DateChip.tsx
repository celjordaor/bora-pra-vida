import type { DateChipInfo } from '@/lib/date'

const STYLES: Record<DateChipInfo['variant'], string> = {
  today: 'bg-navy-600/10 text-navy-600',
  upcoming: 'bg-navy-600/10 text-navy-600',
  overdue: 'bg-red-100 text-red-600',
  future: 'bg-gray-100 text-gray-500',
}

export function DateChip({ label, variant }: DateChipInfo) {
  return (
    <span className={`text-xs rounded-full px-2 py-0.5 ${STYLES[variant]}`}>
      {label}
    </span>
  )
}
