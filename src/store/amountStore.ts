import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReferralAmount } from '@/types';
import { generateId } from '@/lib/utils';

interface AmountState {
  currentAmount: ReferralAmount | null;
  history: ReferralAmount[];
  setCurrentAmount: (amount: ReferralAmount | null) => void;
  saveAmount: (data: Omit<ReferralAmount, 'id' | 'updatedAt'>) => void;
  updateAmount: (id: string, data: Partial<ReferralAmount>) => void;
}

export const useAmountStore = create<AmountState>()(
  persist(
    (set) => ({
      currentAmount: null,
      history: [],

      setCurrentAmount: (amount) => set({ currentAmount: amount }),

      saveAmount: (data) => {
        const now = new Date();
        const newAmount: ReferralAmount = {
          ...data,
          id: generateId(),
          updatedAt: now,
        };
        set((state) => ({
          currentAmount: newAmount,
          history: [newAmount, ...state.history],
        }));
      },

      updateAmount: (id, data) => {
        set((state) => ({
          history: state.history.map((a) =>
            a.id === id ? { ...a, ...data, updatedAt: new Date() } : a
          ),
          currentAmount:
            state.currentAmount?.id === id
              ? { ...state.currentAmount, ...data, updatedAt: new Date() }
              : state.currentAmount,
        }));
      },
    }),
    {
      name: 'bni-amount-storage',
    }
  )
);
