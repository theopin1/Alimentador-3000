import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { FeedingSchedule } from '../../../services/types';
import { formatDaysSummary, formatTime } from './scheduleUtils';
import { deviceDetailStrings } from '../../../strings/pt-br';

interface ScheduleCardProps {
  schedule: FeedingSchedule;
  onEdit: (schedule: FeedingSchedule) => void;
  onDelete: (schedule: FeedingSchedule) => void;
  isDeleting?: boolean;
}

export function ScheduleCard({
  schedule,
  onEdit,
  onDelete,
  isDeleting = false,
}: ScheduleCardProps) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-3 ring-1 ring-zinc-200">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-zinc-900">
            {formatTime(schedule.scheduled_time)}
          </span>
          {!schedule.is_active && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
              {deviceDetailStrings.scheduleCard.inactive}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {formatDaysSummary(schedule.days_of_week)} · {schedule.portion_grams} g
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(schedule)}
          aria-label={deviceDetailStrings.scheduleCard.editAriaLabel}
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          <FiEdit2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(schedule)}
          disabled={isDeleting}
          aria-label={deviceDetailStrings.scheduleCard.deleteAriaLabel}
          className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:text-zinc-300"
        >
          <FiTrash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default ScheduleCard;
