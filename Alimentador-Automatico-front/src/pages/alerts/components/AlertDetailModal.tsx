import { useEffect, useState } from 'react';
import { LuCheck } from 'react-icons/lu';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import type { Alert, ID } from '../../../services/types';
import {
  formatAlertDateTime,
  formatAlertType,
  getDeviceLabel,
  getSeverityInfo,
  isResolved,
} from './alertUtils';
import { alertsStrings } from '../../../strings/pt-br';

interface AlertDetailModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (alertId: ID) => Promise<void>;
  onResolve: (alertId: ID) => Promise<void>;
}

export function AlertDetailModal({
  alert,
  isOpen,
  onClose,
  onMarkAsRead,
  onResolve,
}: AlertDetailModalProps) {
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsMarkingRead(false);
      setIsResolving(false);
    }
  }, [isOpen]);

  if (!alert) return null;

  const severity = getSeverityInfo(alert.severity);
  const resolved = isResolved(alert);

  async function handleToggleRead() {
    if (!alert || alert.is_read || isMarkingRead) return;
    setIsMarkingRead(true);
    try {
      await onMarkAsRead(alert.id);
    } finally {
      setIsMarkingRead(false);
    }
  }

  async function handleResolve() {
    if (!alert || resolved || isResolving) return;
    setIsResolving(true);
    try {
      await onResolve(alert.id);
    } finally {
      setIsResolving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={alertsStrings.detail.title}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium ${severity.textClassName}`}
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${severity.dotClassName}`}
            />
            {alertsStrings.severityLabel(severity.label)}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              resolved
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {resolved ? alertsStrings.resolved : alertsStrings.open}
          </span>
        </div>

        <div>
          <h3 className="text-base font-semibold text-zinc-900">
            {formatAlertType(alert.type)}
          </h3>
          <p className="mt-1 text-sm text-zinc-600">{alert.message}</p>
        </div>

        <dl className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-zinc-500">{alertsStrings.detail.device}</dt>
            <dd className="text-right font-medium text-zinc-800">
              {getDeviceLabel(alert)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-zinc-500">{alertsStrings.detail.createdAt}</dt>
            <dd className="text-right font-medium text-zinc-800">
              {formatAlertDateTime(alert.created_at)}
            </dd>
          </div>
          {resolved && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">{alertsStrings.detail.resolvedAt}</dt>
              <dd className="text-right font-medium text-zinc-800">
                {formatAlertDateTime(alert.resolved_at)}
              </dd>
            </div>
          )}
        </dl>

        <label
          className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
            alert.is_read
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'cursor-pointer border-zinc-200 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          <input
            type="checkbox"
            checked={alert.is_read}
            disabled={alert.is_read || isMarkingRead}
            onChange={() => void handleToggleRead()}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed"
          />
          <span className="flex items-center gap-1.5">
            {alert.is_read && <LuCheck className="h-4 w-4" aria-hidden="true" />}
            {alert.is_read
              ? alertsStrings.detail.markedAsRead
              : isMarkingRead
                ? alertsStrings.detail.markingAsRead
                : alertsStrings.detail.markAsRead}
          </span>
        </label>

        <Button
          type="button"
          fullWidth
          onClick={() => void handleResolve()}
          disabled={resolved || isResolving}
          isLoading={isResolving}
        >
          {resolved
            ? alertsStrings.detail.resolvedButton
            : alertsStrings.detail.resolveButton}
        </Button>
      </div>
    </Modal>
  );
}

export default AlertDetailModal;
