import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeeklyReport, Member } from '@/types';
import { generateId } from '@/lib/utils';

interface WeeklyState {
  currentReport: WeeklyReport | null;
  reports: WeeklyReport[];
  cumulativeAmount: number; // 成會至今累計金額
  foundingYear: number; // 成會年份（民國年）
  setCumulativeAmount: (amount: number) => void;
  setFoundingYear: (year: number) => void;
  setCurrentReport: (report: WeeklyReport | null) => void;
  addReport: (report: Omit<WeeklyReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReport: (id: string, data: Partial<WeeklyReport>) => void;
  deleteReport: (id: string) => void;
  getReportSummary: () => {
    totalInternalReferrals: number;
    totalExternalReferrals: number;
    totalReferrals: number;
    totalOneToOne: number;
    totalGuests: number;
    totalTransactionValue: number;
  } | null;
}

export const useWeeklyStore = create<WeeklyState>()(
  persist(
    (set, get) => ({
      currentReport: null,
      reports: [],
      cumulativeAmount: 0,
      foundingYear: 104, // 預設民國104年

      setCumulativeAmount: (amount) => set({ cumulativeAmount: amount }),
      setFoundingYear: (year) => set({ foundingYear: year }),

      setCurrentReport: (report) => set({ currentReport: report }),

      addReport: (reportData) => {
        const now = new Date();
        const newReport: WeeklyReport = {
          ...reportData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          reports: [newReport, ...state.reports],
          currentReport: newReport,
        }));
      },

      updateReport: (id, data) => {
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: new Date() } : r
          ),
          currentReport:
            state.currentReport?.id === id
              ? { ...state.currentReport, ...data, updatedAt: new Date() }
              : state.currentReport,
        }));
      },

      deleteReport: (id) => {
        set((state) => ({
          reports: state.reports.filter((r) => r.id !== id),
          currentReport:
            state.currentReport?.id === id ? null : state.currentReport,
        }));
      },

      getReportSummary: () => {
        const { currentReport } = get();
        if (!currentReport) return null;

        const members = currentReport.members;
        return {
          totalInternalReferrals: members.reduce(
            (sum: number, m: Member) => sum + m.internalReferralGiven,
            0
          ),
          totalExternalReferrals: members.reduce(
            (sum: number, m: Member) => sum + m.externalReferralGiven,
            0
          ),
          totalReferrals: members.reduce(
            (sum: number, m: Member) => sum + m.totalReferrals,
            0
          ),
          totalOneToOne: members.reduce((sum: number, m: Member) => sum + m.oneToOne, 0),
          totalGuests: members.reduce((sum: number, m: Member) => sum + m.guests, 0),
          totalTransactionValue: members.reduce(
            (sum: number, m: Member) => sum + m.transactionValue,
            0
          ),
        };
      },
    }),
    {
      name: 'bni-weekly-storage',
    }
  )
);
