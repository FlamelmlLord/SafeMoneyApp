import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DayBase = 360 | 365;

interface AppState {
  dayBase: DayBase;
  setDayBase: (base: DayBase) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      dayBase: 360,
      setDayBase: (base) => set({ dayBase: base }),
    }),
    {
      name: 'ie-app-pref',
      partialize: (s) => ({ dayBase: s.dayBase }),
    },
  ),
);

export const formatBaseLabel = (b: DayBase): string =>
  b === 360 ? 'Año comercial (360 días)' : 'Año civil (365 días)';
