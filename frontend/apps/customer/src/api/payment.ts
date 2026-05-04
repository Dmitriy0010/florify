import { apiClient } from '@/lib/axios'

export interface PaymentSbpResponse {
  id: string
  orderId: string
  amount: number
  qrCodeData: string
  status: string
}

export const paymentApi = {
  initiateSbp: async (orderId: string): Promise<PaymentSbpResponse> => {
    const response = await apiClient.post<PaymentSbpResponse>(`/api/v1/payments/sbp/${orderId}`)
    return response.data
  },
  
  simulateSuccess: async (orderId: string): Promise<void> => {
    // This calls a debug endpoint designed for diploma project testing
    await apiClient.post(`/api/v1/payments/webhooks/simulate/${orderId}`)
  }
}
