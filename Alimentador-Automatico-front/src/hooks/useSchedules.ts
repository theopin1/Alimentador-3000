import { useCallback, useEffect, useState } from 'react';
import { scheduleService } from '../services/schedule.service';
import type { ApiErrorPayload } from '../services/api';
import type {
  FeedingSchedule,
  ID,
  StoreSchedulePayload,
} from '../services/types';
import { deviceDetailStrings } from '../strings/pt-br';

interface UseSchedulesState {
  schedules: FeedingSchedule[];
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: UseSchedulesState = {
  schedules: [],
  isLoading: true,
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
  return isApiErrorPayload(error)
    ? error.message
    : deviceDetailStrings.schedules.loadError;
}

export function useSchedules(deviceId: ID) {
  const [state, setState] = useState<UseSchedulesState>(INITIAL_STATE);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const schedules = await scheduleService.listByDevice(deviceId);
        if (cancelled) return;
        setState({ schedules, isLoading: false, error: null });
      } catch (error) {
        if (cancelled) return;
        setState({
          schedules: [],
          isLoading: false,
          error: extractMessage(error),
        });
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [deviceId, reloadKey]);

  const refetch = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  const create = useCallback(
    async (payload: StoreSchedulePayload) => {
      const schedule = await scheduleService.create(deviceId, payload);
      setState((prev) => ({
        ...prev,
        schedules: [...prev.schedules, schedule],
      }));
      return schedule;
    },
    [deviceId],
  );

  const update = useCallback(
    async (scheduleId: ID, payload: StoreSchedulePayload) => {
      const schedule = await scheduleService.update(scheduleId, payload);
      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.map((item) =>
          item.id === scheduleId ? schedule : item,
        ),
      }));
      return schedule;
    },
    [],
  );

  const remove = useCallback(async (scheduleId: ID) => {
    await scheduleService.destroy(scheduleId);
    setState((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((item) => item.id !== scheduleId),
    }));
  }, []);

  return {
    schedules: state.schedules,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
    create,
    update,
    remove,
  };
}

export default useSchedules;
