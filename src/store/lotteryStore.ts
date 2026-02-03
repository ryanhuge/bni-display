import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LotteryRecord, LotteryCandidate } from '@/types';
import { generateId } from '@/lib/utils';

interface LotteryState {
  candidates: LotteryCandidate[];
  records: LotteryRecord[];
  currentSessionId: string | null;
  excludeWinners: boolean;
  setCandidates: (candidates: LotteryCandidate[]) => void;
  startNewSession: () => void;
  drawWinner: () => string | null;
  setExcludeWinners: (exclude: boolean) => void;
  clearRecords: () => void;
  getSessionRecords: () => LotteryRecord[];
}

export const useLotteryStore = create<LotteryState>()(
  persist(
    (set, get) => ({
      candidates: [],
      records: [],
      currentSessionId: null,
      excludeWinners: true,

      setCandidates: (candidates) => set({ candidates }),

      startNewSession: () => {
        set({ currentSessionId: generateId() });
      },

      drawWinner: () => {
        const { candidates, records, currentSessionId, excludeWinners } = get();

        if (!currentSessionId) {
          set({ currentSessionId: generateId() });
        }

        const sessionId = get().currentSessionId!;

        // 建立加權抽獎池
        let pool: string[] = [];
        const sessionWinners = excludeWinners
          ? records
              .filter((r) => r.sessionId === sessionId)
              .map((r) => r.winner)
          : [];

        candidates.forEach((candidate) => {
          if (!excludeWinners || !sessionWinners.includes(candidate.name)) {
            for (let i = 0; i < candidate.chances; i++) {
              pool.push(candidate.name);
            }
          }
        });

        if (pool.length === 0) return null;

        // 隨機抽選
        const winnerIndex = Math.floor(Math.random() * pool.length);
        const winner = pool[winnerIndex];

        // 記錄
        const sessionRecords = records.filter((r) => r.sessionId === sessionId);
        const round = sessionRecords.length + 1;

        const newRecord: LotteryRecord = {
          id: generateId(),
          winner,
          timestamp: new Date(),
          round,
          sessionId,
        };

        set((state) => ({
          records: [newRecord, ...state.records],
        }));

        return winner;
      },

      setExcludeWinners: (exclude) => set({ excludeWinners: exclude }),

      clearRecords: () => set({ records: [], currentSessionId: null }),

      getSessionRecords: () => {
        const { records, currentSessionId } = get();
        if (!currentSessionId) return [];
        return records
          .filter((r) => r.sessionId === currentSessionId)
          .sort((a, b) => a.round - b.round);
      },
    }),
    {
      name: 'bni-lottery-storage',
    }
  )
);
