import { useCallback, useEffect, useState } from 'react';
import { feedingService } from '../services/feeding.service';
import type { ApiErrorPayload } from '../services/api';
import type { FeedingEvent, ID } from '../services/types';
import { historyStrings } from '../strings/pt-br';

interface UseFeedingHistoryState {
  events: FeedingEvent[];
  currentPage: number;
  lastPage: number;
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

const INITIAL_STATE: UseFeedingHistoryState = {
  events: [],
  currentPage: 0,
  lastPage: 1,
  total: 0,
  isLoading: false,
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
  return isApiErrorPayload(error) ? error.message : historyStrings.loadError;
}

export function useFeedingHistory(deviceId: ID | null) {
  const [state, setState] = useState<UseFeedingHistoryState>(INITIAL_STATE);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (deviceId === null) {
      setState(INITIAL_STATE);
      return;
    }

    let cancelled = false;
    setState({ ...INITIAL_STATE, isLoading: true });

    async function load(id: ID) {
      try {
        const page = await feedingService.history(id, 1);
        if (cancelled) return;
        setState({
          events: page.data,
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
          error: extractMessage(error),
        });
      }
    }

    void load(deviceId);

    return () => {
      cancelled = true;
    };
  }, [deviceId, reloadKey]);

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const loadMore = useCallback(async () => {
    if (deviceId === null) return;
    if (state.isLoadingMore || state.currentPage >= state.lastPage) return;

    const nextPage = state.currentPage + 1;
    setState((prev) => ({ ...prev, isLoadingMore: true, error: null }));

    try {
      const page = await feedingService.history(deviceId, nextPage);
      setState((prev) => ({
        ...prev,
        events: [...prev.events, ...page.data],
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
  }, [deviceId, state.currentPage, state.lastPage, state.isLoadingMore]);

  return {
    events: state.events,
    total: state.total,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    hasMore: state.currentPage < state.lastPage,
    error: state.error,
    refetch,
    loadMore,
  };
}

export default useFeedingHistory;
