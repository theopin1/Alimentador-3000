import { api } from './api';
import type {
  FeedingEvent,
  ID,
  ManualFeedPayload,
  Paginated,
} from './types';

export const feedingService = {
  async triggerManualFeed(
    deviceId: ID,
    payload: ManualFeedPayload = {},
  ): Promise<FeedingEvent> {
    const { data } = await api.post<{ message: string; event: FeedingEvent }>(
      `/v1/devices/${deviceId}/feed`,
      payload,
    );
    return data.event;
  },

  async history(
    deviceId: ID,
    page = 1,
    perPage = 30,
  ): Promise<Paginated<FeedingEvent>> {
    const { data } = await api.get<Paginated<FeedingEvent>>(
      `/v1/devices/${deviceId}/events`,
      { params: { per_page: perPage, page } },
    );
    return data;
  },
};

export default feedingService;
