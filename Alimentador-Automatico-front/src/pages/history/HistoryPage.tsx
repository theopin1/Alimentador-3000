import { useEffect, useState } from 'react';
import { InternalLayout } from '../../components/layout/InternalLayout';
import { useDevices } from '../../hooks/useDevices';
import { useFeedingHistory } from '../../hooks/useFeedingHistory';
import type { InternalRoute } from '../../router/types';
import type { ID } from '../../services/types';
import { FeedingEventCard } from './components/FeedingEventCard';
import { commonStrings, historyStrings } from '../../strings/pt-br';

interface HistoryPageProps {
  onNavigate: (route: InternalRoute) => void;
  initialDeviceId?: ID | null;
}

export function HistoryPage({ onNavigate, initialDeviceId }: HistoryPageProps) {
  const {
    devices,
    isLoading: isLoadingDevices,
    error: devicesError,
    refetch: refetchDevices,
  } = useDevices();

  const [selectedDeviceId, setSelectedDeviceId] = useState<ID | null>(
    initialDeviceId ?? null,
  );

  useEffect(() => {
    if (selectedDeviceId !== null) return;
    if (initialDeviceId != null) {
      setSelectedDeviceId(initialDeviceId);
      return;
    }
    if (devices.length > 0) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices, initialDeviceId, selectedDeviceId]);

  const {
    events,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refetch,
    loadMore,
  } = useFeedingHistory(selectedDeviceId);

  function getDeviceName(deviceId: ID): string {
    const device = devices.find((item) => item.id === deviceId);
    return device?.name?.trim() || commonStrings.deviceFallbackName(deviceId);
  }

  return (
    <InternalLayout
      title={historyStrings.title}
      currentRoute="history"
      onNavigate={onNavigate}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="history-device"
            className="text-sm font-semibold text-zinc-800"
          >
            {historyStrings.deviceLabel}
          </label>
          <select
            id="history-device"
            value={selectedDeviceId ?? ''}
            onChange={(event) =>
              setSelectedDeviceId(
                event.target.value ? Number(event.target.value) : null,
              )
            }
            disabled={isLoadingDevices || devices.length === 0}
            className="w-full rounded-md border border-transparent bg-zinc-200 px-3 py-3 text-sm text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingDevices && <option value="">{commonStrings.loading}</option>}
            {!isLoadingDevices && devices.length === 0 && (
              <option value="">{historyStrings.noDevices}</option>
            )}
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name?.trim() || commonStrings.deviceFallbackName(device.id)}
              </option>
            ))}
          </select>
        </div>

        {devicesError && (
          <div className="flex flex-col items-center gap-2 rounded-md bg-red-50 px-3 py-4 text-center">
            <p className="text-sm text-red-700">{devicesError}</p>
            <button
              type="button"
              onClick={refetchDevices}
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-900"
            >
              {commonStrings.retry}
            </button>
          </div>
        )}

        {selectedDeviceId !== null && (
          <section className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold text-zinc-900">
                {getDeviceName(selectedDeviceId)}
              </h2>
              {!isLoading && !error && total > 0 && (
                <span className="text-xs text-zinc-400">
                  {historyStrings.recordCount(total)}
                </span>
              )}
            </div>

            {isLoading && (
              <p className="py-4 text-center text-sm text-zinc-500">
                {historyStrings.loading}
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

            {!isLoading && !error && events.length === 0 && (
              <p className="rounded-md bg-white px-3 py-6 text-center text-sm text-zinc-500 ring-1 ring-zinc-200">
                {historyStrings.empty}
              </p>
            )}

            {!isLoading &&
              !error &&
              events.map((event) => (
                <FeedingEventCard key={event.id} event={event} />
              ))}

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
          </section>
        )}
      </div>
    </InternalLayout>
  );
}

export default HistoryPage;
