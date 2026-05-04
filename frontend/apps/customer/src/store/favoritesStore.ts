import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FavoriteItem {
  productId: string
  name: string
  price: number
  image?: string | null
}

interface FavoritesState {
  items: FavoriteItem[]
  addItem: (item: FavoriteItem) => void
  removeItem: (productId: string) => void
  hasItem: (productId: string) => boolean
  getTotalItems: () => number
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          if (state.items.find((i) => i.productId === item.productId)) {
            return state // already in favorites
          }
          return { items: [...state.items, item] }
        })
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },
      
      hasItem: (productId) => {
        return get().items.some((i) => i.productId === productId)
      },
      
      getTotalItems: () => {
        return get().items.length
      },
    }),
    {
      name: 'florify-favorites-storage',
    }
  )
)
