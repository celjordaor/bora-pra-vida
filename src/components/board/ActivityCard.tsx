import type { Activity, ActivityStatus } from '@/types/activity'
import { getDateChipInfo } from '@/lib/date'
import { nextStatus, prevStatus } from '@/lib/activities'
import { describeRecurrence } from '@/lib/recurrence'
import { SwipeableRow } from '@/components/ui/SwipeableRow'
import { PriorityDot } from './PriorityDot'
import { DateChip } from './DateChip'

interface Props {
  activity: Activity
  onClick: () => void
  onStatusChange: (status: ActivityStatus) => void
  onSwipeDelete?: () => void
}

export function ActivityCard({ activity, onClick, onStatusChange, onSwipeDelete }: Props) {
  const dateChip = getDateChipInfo(activity.due_date, activity.status)
  const recurrenceLabel = describeRecurrence(activity.recurrence_rule)
  const subtasks = activity.subtasks ?? []
  const doneCount = subtasks.filter((s) => s.done).length

  return (
    <SwipeableRow
      onSwipeRight={
        activity.status !== 'done' ? () => onStatusChange(nextStatus(activity.status)) : undefined
      }
      onSwipeLeft={onSwipeDelete}
      rightLabel="→ Avançar"
    >
      <div
        onClick={onClick}
        className="bg-white rounded-lg ring-1 ring-black/5 p-3 flex flex-col gap-2 cursor-pointer hover:ring-navy-600/30 transition-shadow"
      >
        <div className="flex items-start gap-2">
          <PriorityDot priority={activity.priority} />
          <p className="text-sm font-medium text-navy-950 flex-1 leading-snug">
            {activity.title}
          </p>
          {recurrenceLabel && (
            <span title={recurrenceLabel} className="text-xs shrink-0">
              🔁
            </span>
          )}
          {activity.from_note && (
            <span title="Criada a partir de uma nota" className="text-xs shrink-0">
              📝
            </span>
          )}
        </div>

        {(dateChip || subtasks.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            {dateChip && <DateChip {...dateChip} />}
            {subtasks.length > 0 && (
              <span className="text-xs text-gray-400">
                {doneCount}/{subtasks.length}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center pt-1" onClick={(e) => e.stopPropagation()}>
          {activity.status !== 'todo' ? (
            <button
              onClick={() => onStatusChange(prevStatus(activity.status))}
              className="text-xs text-gray-400 hover:text-navy-600"
            >
              ← voltar
            </button>
          ) : (
            <span />
          )}
          {activity.status !== 'done' && (
            <button
              onClick={() => onStatusChange(nextStatus(activity.status))}
              className="text-xs text-navy-600 hover:text-navy-950 ml-auto"
            >
              avançar →
            </button>
          )}
        </div>
      </div>
    </SwipeableRow>
  )
}
