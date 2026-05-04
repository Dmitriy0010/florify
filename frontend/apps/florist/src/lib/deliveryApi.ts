import { apiClient } from './apiClient';

export interface DeliverySlot {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  remainingCapacity: number;
  active: boolean;
}

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
  getSlots: async (date?: string) => {
    const { data } = await apiClient.get<DeliverySlot[]>('/v1/delivery/slots', {
      params: { date }
    });
    return data;
  },

  getTasks: async (params: { courierId?: string; date?: string; status?: string } = {}) => {
    const { data } = await apiClient.get<DeliveryTask[]>('/v1/delivery/tasks', {
      params
    });
    return data;
  },

  getMyTasks: async () => {
    const { data } = await apiClient.get<DeliveryTask[]>('/v1/delivery/tasks/my');
    return data;
  },

  getFreeTasks: async () => {
    const { data } = await apiClient.get<DeliveryTask[]>('/v1/delivery/tasks/free');
    return data;
  },

  getTaskById: async (id: string) => {
    const { data } = await apiClient.get<DeliveryTask>(`/v1/delivery/tasks/${id}`);
    return data;
  },

  getTaskByOrderId: async (orderId: string) => {
    const { data } = await apiClient.get<DeliveryTask>(`/v1/delivery/tasks/order/${orderId}`);
    return data;
  },

  createTask: async (payload: any) => {
    const { data } = await apiClient.post<DeliveryTask>('/v1/delivery/tasks', payload);
    return data;
  },

  assignCourier: async (taskId: string, courierId: string) => {
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
