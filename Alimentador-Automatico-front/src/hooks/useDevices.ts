import { useCallback, useEffect, useState } from 'react';
import { deviceService } from '../services/device.service';
import type { ApiErrorPayload } from '../services/api';
import type { Device } from '../services/types';
import { devicesStrings } from '../strings/pt-br';

interface UseDevicesState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: UseDevicesState = {
  devices: [],
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
  return isApiErrorPayload(error) ? error.message : devicesStrings.loadError;
}

export function useDevices() {
  const [state, setState] = useState<UseDevicesState>(INITIAL_STATE);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const devices = await deviceService.list();
        if (cancelled) return;
        setState({ devices, isLoading: false, error: null });
      } catch (error) {
        if (cancelled) return;
        setState({
          devices: [],
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
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  return {
    devices: state.devices,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
  };
}

export default useDevices;
