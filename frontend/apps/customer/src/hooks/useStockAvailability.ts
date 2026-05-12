import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '@/api/inventory'

/**
 * Checks stock availability for a list of products in the selected store.
 *
 * - Returns `{}` if storeId is null (no store selected — skip check)
 * - Returns `Record<productId, inStock>` when storeId is set
 * - Refetches every 30 seconds (stock changes frequently)
 */
export function useStockAvailability(
  storeId: string | null,
  productIds: string[]
) {
  return useQuery({
    queryKey: ['stock-availability', storeId, productIds],
    queryFn: () => inventoryApi.checkAvailability(storeId!, productIds),
    enabled: !!storeId && productIds.length > 0,
    staleTime: 30_000,       // consider fresh for 30 seconds
    refetchInterval: 30_000, // auto-refetch every 30 seconds
    placeholderData: {},     // show all as unknown until data arrives
  })
}
