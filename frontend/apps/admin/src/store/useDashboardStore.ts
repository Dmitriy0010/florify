import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AnalyticsService, StoreService, DashboardStats } from '../lib/api'

interface StoreOption {
  id: string
  name: string
  active: boolean
}

interface DashboardState {
  // Data
  stats: DashboardStats | null
  stores: StoreOption[]
  
  // UI State
  isLoading: boolean
  isStoresLoading: boolean
  error: string | null
  
  // Context
  currentStoreId: string | null
  dateRange: { from: string; to: string } // Store as ISO strings for persistence
  globalSearchTerm: string
  
  // Actions
  setStoreId: (id: string | null) => void
  setDateRange: (range: { from: string; to: string }) => void
  setGlobalSearchTerm: (term: string) => void
  fetchDashboardData: () => Promise<void>
  fetchStores: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      stats: null,
      stores: [],
      isLoading: false,
      isStoresLoading: false,
      error: null,
      currentStoreId: null,
      dateRange: { 
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), 
        to: new Date().toISOString() 
      },
      globalSearchTerm: '',

      setStoreId: (id) => {
        set({ currentStoreId: id })
        get().fetchDashboardData()
      },

      setGlobalSearchTerm: (term) => set({ globalSearchTerm: term }),

      setDateRange: (range) => {
        set({ dateRange: range })
        get().fetchDashboardData()
      },

      fetchStores: async () => {
        set({ isStoresLoading: true })
        try {
          const response = await StoreService.getAll()
          const validStores: StoreOption[] = response.data
            .filter((s: any) => s.id && s.name)
            .map((s: any) => ({
              id: s.id!,
              name: s.name!,
              active: !!s.active
            }))
          set({ stores: validStores, isStoresLoading: false })
        } catch (err: any) {
          set({ isStoresLoading: false, error: 'Failed to load stores' })
        }
      },

      fetchDashboardData: async () => {
        set({ isLoading: true, error: null })
        try {
          const { currentStoreId, dateRange } = get()
          const response = await AnalyticsService.getDashboard({
            storeId: currentStoreId || undefined,
            from: dateRange.from,
            to: dateRange.to
          })
          set({ stats: response.data, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      }
    }),
    {
      name: 'florify-admin-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentStoreId: state.currentStoreId,
        dateRange: state.dateRange 
      }),
    }
  )
)
