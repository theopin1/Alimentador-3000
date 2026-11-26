import { LuClock, LuUtensils } from 'react-icons/lu';
import type { FeedingEvent } from '../../../services/types';
import {
  formatEventDateTime,
  formatTriggerType,
  getStatusBadge,
} from './historyUtils';
import { historyStrings } from '../../../strings/pt-br';

interface FeedingEventCardProps {
  event: FeedingEvent;
}

export function FeedingEventCard({ event }: FeedingEventCardProps) {
  const badge = getStatusBadge(event.status);

  return (
    <article className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-zinc-200">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <LuUtensils className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900">
            {formatTriggerType(event.trigger_type)} ·{' '}
            {historyStrings.portion(event.portion_grams)}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
            <LuClock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatEventDateTime(event)}
          </p>
        </div>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    </article>
  );
}

export default FeedingEventCard;
