import { apiClient } from './apiClient';
import type {
  EnhancedStockBalanceResponse,
  StockBatchDto,
  StockTransaction,
  WriteOffPayload,
} from './types';

export const inventoryApi = {
  getAllBalances: async (storeId?: string | null) => {
    const { data } = await apiClient.get<EnhancedStockBalanceResponse[]>('/v1/inventory/balance/all', {
      params: storeId ? { storeId } : {},
    });
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
    const { data } = await apiClient.get<any>(`/v1/inventory/transactions/${productId}`);
    // Backend returns PagedResult<StockTransaction> with .content field
    if (Array.isArray(data)) return data;
    return data?.content ?? data?.data ?? [];
  },
  writeOff: async (payload: WriteOffPayload) => {
    const { data } = await apiClient.post('/v1/inventory/write-off', payload);
    return data;
  },
  /**
   * Inventory audit: set absolute quantity for a product.
   * Calculates the difference vs current balance and posts a write-off or receipt.
   */
  adjustBalance: async (payload: { productId: string; targetQuantity: number; currentQuantity: number; reason?: string }) => {
    const diff = payload.targetQuantity - payload.currentQuantity;
    if (diff === 0) return;

    if (diff < 0) {
      // Need to write off
      const { data } = await apiClient.post('/v1/inventory/write-off', {
        productId: payload.productId,
        quantity: Math.abs(diff),
        type: 'AUDIT',
        reason: payload.reason || 'Инвентаризация',
      });
      return data;
    } else {
      // Need to add stock — try a receipt endpoint, fallback to write-off negative
      try {
        const { data } = await apiClient.post('/v1/inventory/receive', {
          productId: payload.productId,
          quantity: diff,
          type: 'AUDIT',
          reason: payload.reason || 'Инвентаризация',
        });
        return data;
      } catch {
        // Fallback: use adjust endpoint
        const { data } = await apiClient.post('/v1/inventory/adjust', {
          productId: payload.productId,
          quantity: diff,
          reason: payload.reason || 'Инвентаризация',
        });
        return data;
      }
    }
  },
};

