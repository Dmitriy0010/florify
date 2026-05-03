import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ShopState {
  selectedStoreId: string | null
  setSelectedStoreId: (id: string | null) => void
}

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      selectedStoreId: null,
      setSelectedStoreId: (id) => set({ selectedStoreId: id }),
    }),
    {
      name: 'florify-shop-storage',
    }
  )
)
