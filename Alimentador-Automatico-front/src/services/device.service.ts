import { api } from './api';
import type {
  Device,
  ID,
  MessageResponse,
  PairDevicePayload,
  UpdateDevicePayload,
} from './types';

export const deviceService = {
  async list(): Promise<Device[]> {
    const { data } = await api.get<{ devices: Device[] }>('/v1/devices');
    return data.devices;
  },

  async pair(payload: PairDevicePayload): Promise<Device> {
    const { data } = await api.post<{ message: string; device: Device }>(
      '/v1/devices/pair',
      payload,
    );
    return data.device;
  },

  async show(deviceId: ID): Promise<Device> {
    const { data } = await api.get<{ device: Device }>(`/v1/devices/${deviceId}`);
    return data.device;
  },

  async update(deviceId: ID, payload: UpdateDevicePayload): Promise<Device> {
    const { data } = await api.put<{ message: string; device: Device }>(
      `/v1/devices/${deviceId}`,
      payload,
    );
    return data.device;
  },

  async destroy(deviceId: ID): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`/v1/devices/${deviceId}`);
    return data;
  },
};

export default deviceService;
