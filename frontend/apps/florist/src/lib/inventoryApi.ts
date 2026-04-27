import { apiClient } from './apiClient';
import type {
  EnhancedStockBalanceResponse,
  StockBatchDto,
  StockTransaction,
  WriteOffPayload,
} from './types';

export const inventoryApi = {
  getAllBalances: async () => {
    const { data } = await apiClient.get<EnhancedStockBalanceResponse[]>('/v1/inventory/balance/all');
    return data;
  },
  getBalance: async (productId: string) => {
    const { data } = await apiClient.get<EnhancedStockBalanceResponse>(`/v1/inventory/balance/${productId}`);
    return data;
  },
  getBatches: async (productId: string) => {
    const { data } = await apiClient.get<StockBatchDto[]>(`/v1/inventory/batches/${productId}`);
    return data;
  },
  getTransactions: async (productId: string) => {
    const { data } = await apiClient.get<{ data?: StockTransaction[] } | StockTransaction[]>(
      `/v1/inventory/transactions/${productId}`,
    );
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  writeOff: async (payload: WriteOffPayload) => {
    const { data } = await apiClient.post('/v1/inventory/write-off', payload);
    return data;
  },
};
