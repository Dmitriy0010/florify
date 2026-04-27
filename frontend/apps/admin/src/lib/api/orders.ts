import { apiClient } from './client';
import { OrderKanbanResponse, OrderStatus } from '../api';

export type { OrderKanbanResponse };

export const getKanbanOrders = async (status: OrderStatus, limit = 50): Promise<OrderKanbanResponse[]> => {
  const { data } = await apiClient.get<OrderKanbanResponse[]>('/v1/orders/kanban', {
    params: { status, limit }
  });
  return data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus, floristId?: string) => {
  const { data } = await apiClient.put(`/v1/orders/${id}/status`, {
    status,
    floristId
  });
  return data;
};
