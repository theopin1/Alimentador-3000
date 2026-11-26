import { api, deviceApi } from './api';
import type {
  ID,
  Paginated,
  TelemetryIngestPayload,
  TelemetryReading,
} from './types';

export const telemetryService = {
  async history(
    deviceId: ID,
    perPage = 50,
  ): Promise<Paginated<TelemetryReading>> {
    const { data } = await api.get<Paginated<TelemetryReading>>(
      `/v1/devices/${deviceId}/telemetry`,
      { params: { per_page: perPage } },
    );
    return data;
  },

  async latest(deviceId: ID): Promise<TelemetryReading | null> {
    const { data } = await api.get<{ reading: TelemetryReading | null }>(
      `/v1/devices/${deviceId}/telemetry/latest`,
    );
    return data.reading;
  },

  async ingest(payload: TelemetryIngestPayload): Promise<TelemetryReading> {
    const { data } = await deviceApi.post<{
      message: string;
      reading: TelemetryReading;
    }>('/v1/ingest/telemetry', payload);
    return data.reading;
  },
};

export default telemetryService;
