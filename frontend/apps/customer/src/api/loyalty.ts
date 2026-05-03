import { apiClient } from '@/lib/axios'
import type { LoyaltyAccount, LoyaltyTierInfo, LoyaltyTransaction } from './types'

export const loyaltyApi = {
  getMyAccount: async () => {
    try {
      const { data } = await apiClient.get<LoyaltyAccount>('/api/v1/loyalty/accounts/me')
      return data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  getTiers: async () => {
    const { data } = await apiClient.get<LoyaltyTierInfo[]>('/api/v1/loyalty/tiers')
    return data
  },

  getMyTransactions: async () => {
    // Note: The backend uses /api/v1/loyalty/accounts/{customerId}/transactions
    // But for the customer app, we'll need the customerId. 
    // We can get it from getMyAccount or auth/me.
    // However, for now let's assume we can get it from the account.
    const account = await loyaltyApi.getMyAccount()
    if (!account) return []
    const { data } = await apiClient.get<LoyaltyTransaction[]>(`/api/v1/loyalty/accounts/${account.customerId}/transactions`)
    return data
  }
}
