import { apiClient } from '@/lib/axios'
import type { CreateOrderRequest, Order } from './types'

export const ordersApi = {
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<Order>('/api/v1/orders', data)
    return response.data
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/api/v1/orders/${id}`)
    return response.data
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/api/v1/orders/my')
    return response.data
  },
}
