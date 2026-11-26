import { LuClock } from 'react-icons/lu';
import type { Alert } from '../../../services/types';
import {
  formatAlertDateTime,
  formatAlertType,
  getDeviceLabel,
  getSeverityInfo,
  isResolved,
} from './alertUtils';
import { alertsStrings } from '../../../strings/pt-br';

interface AlertCardProps {
  alert: Alert;
  onClick: (alert: Alert) => void;
}

export function AlertCard({ alert, onClick }: AlertCardProps) {
  const severity = getSeverityInfo(alert.severity);
  const resolved = isResolved(alert);

  return (
    <button
      type="button"
      onClick={() => onClick(alert)}
      className="flex w-full items-stretch gap-0 overflow-hidden rounded-xl bg-white text-left ring-1 ring-zinc-200 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
    >
      <span
        title={alertsStrings.severityLabel(severity.label)}
        className={`w-2  ${severity.dotClassName}`}
      />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">

          <div className="min-w-0">
            <p
              className={`truncate text-sm ${
                alert.is_read
                  ? 'font-medium text-zinc-700'
                  : 'font-semibold text-zinc-900'
              }`}
            >
              {formatAlertType(alert.type)}
            </p>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {getDeviceLabel(alert)}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
              <LuClock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatAlertDateTime(alert.created_at)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {!alert.is_read && (
            <span
              aria-label={alertsStrings.unread}
              className="h-2.5 w-2.5 rounded-full bg-red-500"
            />
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              resolved
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {resolved ? alertsStrings.resolved : alertsStrings.open}
          </span>
        </div>
      </div>
    </button>
  );
}

export default AlertCard;
