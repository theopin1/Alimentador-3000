import { useState } from 'react';
import { InternalLayout } from '../../components/layout/InternalLayout';
import { useAlerts } from '../../hooks/useAlerts';
import { useToast } from '../../hooks/useToast';
import type { InternalRoute } from '../../router/types';
import type { Alert, ID } from '../../services/types';
import { AlertCard } from './components/AlertCard';
import { AlertDetailModal } from './components/AlertDetailModal';
import { commonStrings, alertsStrings } from '../../strings/pt-br';

interface AlertsPageProps {
  onNavigate: (route: InternalRoute) => void;
}

export function AlertsPage({ onNavigate }: AlertsPageProps) {
  const {
    alerts,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refetch,
    loadMore,
    markAsRead,
    resolve,
  } = useAlerts();
  const { showToast } = useToast();

  const [selectedAlertId, setSelectedAlertId] = useState<ID | null>(null);

  const selectedAlert =
    selectedAlertId === null
      ? null
      : (alerts.find((item) => item.id === selectedAlertId) ?? null);

  function handleOpenAlert(alert: Alert) {
    setSelectedAlertId(alert.id);
  }

  function handleCloseModal() {
    setSelectedAlertId(null);
  }

  async function handleMarkAsRead(alertId: ID) {
    try {
      await markAsRead(alertId);
    } catch {
      showToast(alertsStrings.markAsReadError, {
        variant: 'error',
      });
    }
  }

  async function handleResolve(alertId: ID) {
    try {
      await resolve(alertId);
      showToast(alertsStrings.resolveSuccess, { variant: 'success' });
    } catch {
      showToast(alertsStrings.resolveError, { variant: 'error' });
    }
  }

  return (
    <InternalLayout title={alertsStrings.title} currentRoute="alerts" onNavigate={onNavigate}>
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-zinc-900">
            {alertsStrings.heading}
          </h2>
          {!isLoading && !error && total > 0 && (
            <span className="text-xs text-zinc-400">
              {alertsStrings.alertCount(total)}
            </span>
          )}
        </div>

        {isLoading && (
          <p className="py-4 text-center text-sm text-zinc-500">
            {alertsStrings.loading}
          </p>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center gap-2 rounded-md bg-red-50 px-3 py-4 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-900"
            >
              {commonStrings.retry}
            </button>
          </div>
        )}

        {!isLoading && !error && alerts.length === 0 && (
          <p className="rounded-md bg-white px-3 py-6 text-center text-sm text-zinc-500 ring-1 ring-zinc-200">
            {alertsStrings.empty}
          </p>
        )}

        {!isLoading && !error && (
          <section className="flex flex-col gap-2.5">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onClick={handleOpenAlert}
              />
            ))}
          </section>
        )}

        {!isLoading && !error && hasMore && (
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={isLoadingMore}
            className="mt-1 self-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {isLoadingMore ? commonStrings.loading : commonStrings.loadMore}
          </button>
        )}
      </div>

      <AlertDetailModal
        alert={selectedAlert}
        isOpen={selectedAlert !== null}
        onClose={handleCloseModal}
        onMarkAsRead={handleMarkAsRead}
        onResolve={handleResolve}
      />
    </InternalLayout>
  );
}

export default AlertsPage;
