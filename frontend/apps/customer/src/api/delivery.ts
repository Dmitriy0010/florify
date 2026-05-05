import axios from 'axios'
import type { DeliverySlot } from './types'

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Adjust base URL as needed
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const deliveryApi = {
  getSlots: async (date?: string) => {
    const { data } = await api.get<DeliverySlot[]>('/v1/delivery/slots', {
      params: { date }
    })
    return data
  }
}
