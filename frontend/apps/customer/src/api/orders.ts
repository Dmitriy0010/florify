import axios from 'axios'
import type { CreateOrderRequest, Order } from './types'

const API_BASE_URL = 'http://localhost:8080/api/v1/orders'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const ordersApi = {
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>('', data)
    return response.data
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/${id}`)
    return response.data
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/my')
    return response.data
  },
}
