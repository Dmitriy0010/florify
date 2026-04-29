import { apiClient } from './apiClient';

export interface DeliveryTask {
  id: string;
  orderId: string;
  slotId?: string;
  zoneId?: string;
  courierId?: string;
  deliveryAddress: string;
  latitude?: number;
  longitude?: number;
  status: 'CREATED' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  estimatedArrival?: string;
  actualDeliveredAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const deliveryApi = {
  getMyTasks: async () => {
    const { data } = await apiClient.get<DeliveryTask[]>('/v1/delivery/tasks/my');
    return data;
  },
  getFreeTasks: async () => {
    const { data } = await apiClient.get<DeliveryTask[]>('/v1/delivery/tasks/free');
    return data;
  },
  assignMe: async (taskId: string, courierId: string) => {
    const { data } = await apiClient.put<DeliveryTask>(`/v1/delivery/tasks/${taskId}/assign`, {
      courierId
    });
    return data;
  },
  updateStatus: async (taskId: string, status: string, failureReason?: string) => {
    const { data } = await apiClient.put<DeliveryTask>(`/v1/delivery/tasks/${taskId}/status`, {
      newStatus: status,
      failureReason
    });
    return data;
  }
};
