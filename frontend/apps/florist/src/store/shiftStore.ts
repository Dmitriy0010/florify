import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ShiftState {
  isShiftOpen: boolean;
  shiftStart: string | null; // ISO string
  openShift: (startTime: string) => void;
  closeShift: () => void;
}

export const useShiftStore = create<ShiftState>()(
  persist(
    (set) => ({
      isShiftOpen: false,
      shiftStart: null,
      openShift: (startTime) => set({ isShiftOpen: true, shiftStart: startTime }),
      closeShift: () => set({ isShiftOpen: false, shiftStart: null }),
    }),
    {
      name: 'florify-shift',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
