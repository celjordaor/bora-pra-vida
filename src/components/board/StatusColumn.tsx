import type { Activity, ActivityStatus } from '@/types/activity'
import { ActivityCard } from './ActivityCard'

interface Props {
  title: string
  status: ActivityStatus
  activities: Activity[]
  onCardClick: (activity: Activity) => void
  onStatusChange: (id: string, status: ActivityStatus) => void
  onAddClick: () => void
}

export function StatusColumn({
  title,
  status,
  activities,
  onCardClick,
  onStatusChange,
  onAddClick,
}: Props) {
  return (
    <div className="flex-1 min-w-[260px] bg-gray-50 rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-navy-950">{title}</h3>
        <span className="text-xs text-gray-400">{activities.length}</span>
      </div>

      <div className="flex flex-col gap-2">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onClick={() => onCardClick(activity)}
            onStatusChange={(s) => onStatusChange(activity.id, s)}
          />
        ))}
        {activities.length === 0 && (
          <p className="text-xs text-gray-400 px-1">Nada por aqui.</p>
        )}
      </div>

      {status === 'todo' && (
        <button
          onClick={onAddClick}
          className="text-sm text-navy-600 hover:text-navy-950 text-left px-1 mt-1"
        >
          + Nova atividade
        </button>
      )}
    </div>
  )
}
