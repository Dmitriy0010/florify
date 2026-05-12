import { apiClient } from '@/lib/axios'

/**
 * Public API — no auth required.
 * Checks availability of multiple products in a given store.
 *
 * Returns a map of productId → inStock (true = available, false = out of stock).
 */
export const inventoryApi = {
  checkAvailability: async (
    storeId: string,
    productIds: string[]
  ): Promise<Record<string, boolean>> => {
    if (!storeId || productIds.length === 0) return {}
    const { data } = await apiClient.get<Record<string, boolean>>(
      '/api/v1/inventory/public/availability',
      {
        params: {
          storeId,
          productIds: productIds.join(','),
        },
      }
    )
    return data
  },
}
