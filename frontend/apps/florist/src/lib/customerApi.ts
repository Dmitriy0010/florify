import { apiClient } from './apiClient';
import type { Customer } from './types';

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const customerApi = {
  searchCustomers: async (params: { phone?: string; page?: number; size?: number }) => {
    const { data } = await apiClient.get<PagedResponse<Customer>>('/v1/customers', { params });
    return data;
  },
  getCustomerById: async (id: string) => {
    const { data } = await apiClient.get<Customer>(`/v1/customers/${id}`);
    return data;
  },
  createCustomer: async (payload: { firstName: string; lastName: string; phone: string; email?: string }) => {
    const { data } = await apiClient.post<Customer>('/v1/customers', payload);
    return data;
  },
};
