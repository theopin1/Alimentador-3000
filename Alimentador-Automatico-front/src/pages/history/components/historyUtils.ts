import type {
  FeedingEvent,
  FeedingEventStatus,
  FeedingTriggerType,
} from '../../../services/types';
import { commonStrings, historyStrings } from '../../../strings/pt-br';

export function formatEventDateTime(event: FeedingEvent): string {
  const date = event.executed_at ?? event.created_at;
  if (!date) return commonStrings.emptyValue;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return commonStrings.emptyValue;
  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTriggerType(trigger: FeedingTriggerType): string {
  switch (trigger) {
    case 'manual':
      return historyStrings.triggerType.manual;
    case 'scheduled':
      return historyStrings.triggerType.scheduled;
    case 'remote':
      return historyStrings.triggerType.remote;
    default:
      return historyStrings.triggerType.default;
  }
}

interface StatusBadge {
  label: string;
  className: string;
}

export function getStatusBadge(status: FeedingEventStatus): StatusBadge {
  switch (status) {
    case 'success':
      return {
        label: historyStrings.status.success,
        className: 'bg-emerald-100 text-emerald-700',
      };
    case 'failure':
      return {
        label: historyStrings.status.failure,
        className: 'bg-red-100 text-red-700',
      };
    case 'pending':
      return {
        label: historyStrings.status.pending,
        className: 'bg-amber-100 text-amber-700',
      };
    default:
      return {
        label: status,
        className: 'bg-zinc-100 text-zinc-600',
      };
  }
}
