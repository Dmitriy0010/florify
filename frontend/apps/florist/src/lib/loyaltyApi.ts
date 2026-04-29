import { apiClient } from './apiClient';
import type { LoyaltyAccount, LoyaltyTransaction } from './types';

export const loyaltyApi = {
  getAccount: async (customerId: string) => {
    const { data } = await apiClient.get<LoyaltyAccount>(`/v1/loyalty/accounts/${customerId}`);
    return data;
  },
  getTransactions: async (customerId: string) => {
    const { data } = await apiClient.get<LoyaltyTransaction[]>(`/v1/loyalty/accounts/${customerId}/transactions`);
    return data;
  },
};
