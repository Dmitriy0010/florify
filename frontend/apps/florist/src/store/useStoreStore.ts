import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface StoreState {
  currentStoreId: string | null;
  currentStoreName: string | null;
  setCurrentStore: (id: string, name: string) => void;
  clearStore: () => void;
}

export const useStoreStore = create<StoreState>()(
  persist(
    (set) => ({
      currentStoreId: null,
      currentStoreName: null,
      setCurrentStore: (id, name) => set({ currentStoreId: id, currentStoreName: name }),
      clearStore: () => set({ currentStoreId: null, currentStoreName: null }),
    }),
    {
      name: 'florist-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
