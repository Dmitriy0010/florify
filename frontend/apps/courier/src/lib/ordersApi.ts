import { apiClient } from './apiClient';
import type { OrderDetail } from './types';

export const ordersApi = {
  getById: async (id: string) => {
    const { data } = await apiClient.get<OrderDetail>(`/v1/orders/${id}`);
    return data;
  },
};
