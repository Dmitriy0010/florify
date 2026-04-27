import { apiClient } from './apiClient';
import type { OrderDetail, OrderKanbanItem, OrderStatus } from './types';

export const ordersApi = {
  getKanban: async (status: OrderStatus, limit = 50) => {
    const { data } = await apiClient.get<OrderKanbanItem[]>('/v1/orders/kanban', {
      params: { status, limit },
    });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<OrderDetail>(`/v1/orders/${id}`);
    return data;
  },
  updateStatus: async (id: string, status: OrderStatus, floristId?: string) => {
    const { data } = await apiClient.put<OrderDetail>(`/v1/orders/${id}/status`, {
      status,
      floristId,
    });
    return data;
  },
  takeOrder: async (id: string, floristId: string) => {
    return ordersApi.updateStatus(id, 'IN_PROGRESS', floristId);
  },
  markReady: async (id: string) => {
    return ordersApi.updateStatus(id, 'READY');
  },
};
