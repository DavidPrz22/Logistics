import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface RecentSearchItem {
  id: number;
  sku: string;
  nombre: string;
  productName: string;
  timestamp: number;
}

interface KardexSearchStore {
  recientes: RecentSearchItem[];
  addRecent: (item: Omit<RecentSearchItem, 'timestamp'>) => void;
  removeRecent: (sku: string) => void;
  clearRecientes: () => void;
}

export const useKardexSearchStore = create<KardexSearchStore>()(
  persist(
    (set) => ({
      recientes: [],
      addRecent: (item) =>
        set((state) => {
          const filtered = state.recientes.filter((r) => r.sku !== item.sku);
          const newItem: RecentSearchItem = {
            ...item,
            timestamp: Date.now(),
          };
          return {
            recientes: [newItem, ...filtered].slice(0, 8),
          };
        }),
      removeRecent: (sku) =>
        set((state) => ({
          recientes: state.recientes.filter((r) => r.sku !== sku),
        })),
      clearRecientes: () => set({ recientes: [] }),
    }),
    {
      name: 'kardex-recent-searches',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
