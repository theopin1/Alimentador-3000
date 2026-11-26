import { useCallback, useEffect, useState } from 'react';
import { deviceService } from '../services/device.service';
import { telemetryService } from '../services/telemetry.service';
import { feedingService } from '../services/feeding.service';
import type { ApiErrorPayload } from '../services/api';
import type {
  Device,
  FeedingEvent,
  ID,
  TelemetryReading,
} from '../services/types';
import { deviceDetailStrings } from '../strings/pt-br';

interface UseDeviceDetailState {
  device: Device | null;
  telemetry: TelemetryReading | null;
  latestFeeding: FeedingEvent | null;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: UseDeviceDetailState = {
  device: null,
  telemetry: null,
  latestFeeding: null,
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
  return isApiErrorPayload(error) ? error.message : deviceDetailStrings.loadError;
}

export function useDeviceDetail(deviceId: ID) {
  const [state, setState] = useState<UseDeviceDetailState>(INITIAL_STATE);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [device, telemetry, feedingHistory] = await Promise.all([
          deviceService.show(deviceId),
          telemetryService.latest(deviceId).catch(() => null),
          feedingService.history(deviceId, 1, 1).catch(() => null),
        ]);

        if (cancelled) return;

        setState({
          device,
          telemetry: telemetry ?? device.latest_telemetry ?? null,
          latestFeeding: feedingHistory?.data?.[0] ?? null,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        setState({
          device: null,
          telemetry: null,
          latestFeeding: null,
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

  return {
    device: state.device,
    telemetry: state.telemetry,
    latestFeeding: state.latestFeeding,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
  };
}

export default useDeviceDetail;
