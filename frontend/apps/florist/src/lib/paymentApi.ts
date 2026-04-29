import { apiClient } from './apiClient';

export const paymentApi = {
  initiateSbp: async (orderId: string) => {
    const { data } = await apiClient.post<any>(`/v1/payments/sbp/${orderId}`);
    return data;
  },
  simulateSuccess: async (orderId: string) => {
    const { data } = await apiClient.post(`/v1/payments/webhooks/simulate/${orderId}`);
    return data;
  }
};
