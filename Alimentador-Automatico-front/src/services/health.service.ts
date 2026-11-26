import { api } from './api';
import type { HealthResponse } from './types';

export const healthService = {
  async check(): Promise<HealthResponse> {
    const { data } = await api.get<HealthResponse>('/v1/health');
    return data;
  },
};

export default healthService;
