import { apiClient } from './apiClient';

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  active: boolean;
}

export const storeApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Store[]>('/v1/stores');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<Store>(`/v1/stores/${id}`);
    return data;
  }
};
