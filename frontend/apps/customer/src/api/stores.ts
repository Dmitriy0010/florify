import { apiClient } from '@/lib/axios'

export interface Store {
  id: string
  name: string
  address: string
  phone: string
  active: boolean
}

export const storesApi = {
  getAll: async (): Promise<Store[]> => {
    const { data } = await apiClient.get<Store[]>('/api/v1/stores')
    return data
  },

  getById: async (id: string): Promise<Store> => {
    const { data } = await apiClient.get<Store>(`/api/v1/stores/${id}`)
    return data
  }
}
