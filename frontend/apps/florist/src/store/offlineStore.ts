import { create } from 'zustand';

interface OfflineState {
  isOnline: boolean;
  pendingCount: number;
  lastSyncAt: Date | null;
  isFlushing: boolean;
  setOnline: (isOnline: boolean) => void;
  setPendingCount: (count: number) => void;
  incrementPending: () => void;
  decrementPending: () => void;
  setLastSyncAt: (value: Date | null) => void;
  setFlushing: (value: boolean) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline: navigator.onLine,
  pendingCount: 0,
  lastSyncAt: null,
  isFlushing: false,
  setOnline: (isOnline) => set({ isOnline }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  incrementPending: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),
  decrementPending: () => set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  setFlushing: (isFlushing) => set({ isFlushing }),
}));
