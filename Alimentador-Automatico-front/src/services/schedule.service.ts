import { api } from './api';
import type {
  FeedingSchedule,
  ID,
  MessageResponse,
  StoreSchedulePayload,
} from './types';

export const scheduleService = {
  async listByDevice(deviceId: ID): Promise<FeedingSchedule[]> {
    const { data } = await api.get<{ schedules: FeedingSchedule[] }>(
      `/v1/devices/${deviceId}/schedules`,
    );
    return data.schedules;
  },

  async create(
    deviceId: ID,
    payload: StoreSchedulePayload,
  ): Promise<FeedingSchedule> {
    const { data } = await api.post<{
      message: string;
      schedule: FeedingSchedule;
    }>(`/v1/devices/${deviceId}/schedules`, payload);
    return data.schedule;
  },

  async update(
    scheduleId: ID,
    payload: StoreSchedulePayload,
  ): Promise<FeedingSchedule> {
    const { data } = await api.put<{
      message: string;
      schedule: FeedingSchedule;
    }>(`/v1/schedules/${scheduleId}`, payload);
    return data.schedule;
  },

  async destroy(scheduleId: ID): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(
      `/v1/schedules/${scheduleId}`,
    );
    return data;
  },
};

export default scheduleService;
