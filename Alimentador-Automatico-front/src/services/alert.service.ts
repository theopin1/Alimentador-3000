import { api } from './api';
import type { Alert, ID, MessageResponse, Paginated } from './types';

export const alertService = {
  async list(page = 1, perPage = 15): Promise<Paginated<Alert>> {
    const { data } = await api.get<Paginated<Alert>>('/v1/alerts', {
      params: { per_page: perPage, page },
    });
    return data;
  },

  async markAsRead(alertId: ID): Promise<MessageResponse> {
    const { data } = await api.put<MessageResponse>(
      `/v1/alerts/${alertId}/read`,
    );
    return data;
  },

  async resolve(alertId: ID): Promise<MessageResponse> {
    const { data } = await api.put<MessageResponse>(
      `/v1/alerts/${alertId}/resolve`,
    );
    return data;
  },
};

export default alertService;
