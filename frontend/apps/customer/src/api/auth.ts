import { apiClient } from '@/lib/axios'
import type { LoginResponse, User } from './types'

export const authApi = {
  login: async (credentials: any) => {
    const { data } = await apiClient.post<LoginResponse>('/api/auth/login', {
      ...credentials,
      deviceInfo: 'web-browser',
    })
    return data
  },

  register: async (credentials: any) => {
    const { data } = await apiClient.post<LoginResponse>('/api/auth/register', {
      ...credentials,
      deviceInfo: 'web-browser',
    })
    return data
  },
  
  getMe: async () => {
    const { data } = await apiClient.get<User>('/api/auth/me')
    return data
  },
}
