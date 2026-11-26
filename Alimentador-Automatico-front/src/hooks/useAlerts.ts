import { useCallback, useEffect, useState } from 'react';
import { alertService } from '../services/alert.service';
import type { ApiErrorPayload } from '../services/api';
import type { Alert, ID } from '../services/types';
import { alertsStrings } from '../strings/pt-br';

interface UseAlertsState {
  alerts: Alert[];
  currentPage: number;
  lastPage: number;
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

const INITIAL_STATE: UseAlertsState = {
  alerts: [],
  currentPage: 0,
  lastPage: 1,
  total: 0,
  isLoading: true,
  isLoadingMore: false,
  error: null,
};

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value
  );
}

function extractMessage(error: unknown): string {
  return isApiErrorPayload(error) ? error.message : alertsStrings.loadError;
}

export function useAlerts() {
  const [state, setState] = useState<UseAlertsState>(INITIAL_STATE);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ ...INITIAL_STATE, isLoading: true });

    async function load() {
      try {
        const page = await alertService.list(1);
        if (cancelled) return;
        setState({
          alerts: page.data,
          currentPage: page.current_page,
          lastPage: page.last_page,
          total: page.total,
          isLoading: false,
          isLoadingMore: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        setState({
          ...INITIAL_STATE,
          isLoading: false,
          error: extractMessage(error),
        });
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const loadMore = useCallback(async () => {
    if (state.isLoadingMore || state.currentPage >= state.lastPage) return;

    const nextPage = state.currentPage + 1;
    setState((prev) => ({ ...prev, isLoadingMore: true, error: null }));

    try {
      const page = await alertService.list(nextPage);
      setState((prev) => ({
        ...prev,
        alerts: [...prev.alerts, ...page.data],
        currentPage: page.current_page,
        lastPage: page.last_page,
        total: page.total,
        isLoadingMore: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoadingMore: false,
        error: extractMessage(error),
      }));
    }
  }, [state.currentPage, state.lastPage, state.isLoadingMore]);

  const markAsRead = useCallback(async (alertId: ID) => {
    await alertService.markAsRead(alertId);
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((item) =>
        item.id === alertId ? { ...item, is_read: true } : item,
      ),
    }));
  }, []);

  const resolve = useCallback(async (alertId: ID) => {
    await alertService.resolve(alertId);
    const resolvedAt = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((item) =>
        item.id === alertId
          ? { ...item, resolved_at: resolvedAt, is_read: true }
          : item,
      ),
    }));
  }, []);

  const unreadCount = state.alerts.filter((item) => !item.is_read).length;

  return {
    alerts: state.alerts,
    total: state.total,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    hasMore: state.currentPage < state.lastPage,
    error: state.error,
    unreadCount,
    refetch,
    loadMore,
    markAsRead,
    resolve,
  };
}

export default useAlerts;
