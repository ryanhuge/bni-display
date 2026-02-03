import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrafficLightStatus, TrafficLightRawData } from '@/types';
import { calculateTrafficLightScores, determineTrafficLight } from '@/lib/traffic-light';
import { generateId } from '@/lib/utils';

interface TrafficLightState {
  statuses: TrafficLightStatus[];
  chapter: string; // 分會名稱
  setChapter: (chapter: string) => void;
  setStatuses: (statuses: TrafficLightStatus[]) => void;
  updateStatus: (id: string, data: Partial<TrafficLightStatus>) => void;
  addOrUpdateMember: (memberName: string, rawData: TrafficLightRawData) => void;
  updateTrainingCredits: (memberName: string, credits: number) => void;
  manualOverrideStatus: (memberName: string, status: 'green' | 'yellow' | 'red' | 'grey') => void;
  removeOverride: (memberName: string) => void;
  getMembersByStatus: (status: 'green' | 'yellow' | 'red' | 'grey') => TrafficLightStatus[];
}

export const useTrafficLightStore = create<TrafficLightState>()(
  persist(
    (set, get) => ({
      statuses: [],
      chapter: '威鋒', // 預設分會名稱

      setChapter: (chapter) => set({ chapter }),

      setStatuses: (statuses) => set({ statuses }),

      updateStatus: (id, data) => {
        set((state) => ({
          statuses: state.statuses.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: new Date() } : s
          ),
        }));
      },

      addOrUpdateMember: (memberName, rawData) => {
        const scores = calculateTrafficLightScores(rawData);
        const status = determineTrafficLight(scores.total);

        set((state) => {
          const existing = state.statuses.find((s) => s.memberName === memberName);

          if (existing) {
            // 如果有手動覆寫，保持手動狀態
            if (existing.isManualOverride) {
              return {
                statuses: state.statuses.map((s) =>
                  s.memberName === memberName
                    ? { ...s, scores, rawData, updatedAt: new Date() }
                    : s
                ),
              };
            }
            // 更新現有會員
            return {
              statuses: state.statuses.map((s) =>
                s.memberName === memberName
                  ? { ...s, status, scores, rawData, updatedAt: new Date() }
                  : s
              ),
            };
          }

          // 新增會員
          const newStatus: TrafficLightStatus = {
            id: generateId(),
            memberId: generateId(),
            memberName,
            status,
            scores,
            rawData,
            isManualOverride: false,
            updatedAt: new Date(),
          };

          return {
            statuses: [...state.statuses, newStatus],
          };
        });
      },

      updateTrainingCredits: (memberName, credits) => {
        set((state) => {
          const member = state.statuses.find((s) => s.memberName === memberName);
          if (!member) return state;

          const newRawData = { ...member.rawData, trainingCredits: credits };
          const scores = calculateTrafficLightScores(newRawData);
          const status = member.isManualOverride
            ? member.status
            : determineTrafficLight(scores.total);

          return {
            statuses: state.statuses.map((s) =>
              s.memberName === memberName
                ? { ...s, status, scores, rawData: newRawData, updatedAt: new Date() }
                : s
            ),
          };
        });
      },

      manualOverrideStatus: (memberName, status) => {
        set((state) => ({
          statuses: state.statuses.map((s) =>
            s.memberName === memberName
              ? { ...s, status, isManualOverride: true, updatedAt: new Date() }
              : s
          ),
        }));
      },

      removeOverride: (memberName) => {
        set((state) => {
          const member = state.statuses.find((s) => s.memberName === memberName);
          if (!member) return state;

          const status = determineTrafficLight(member.scores.total);

          return {
            statuses: state.statuses.map((s) =>
              s.memberName === memberName
                ? { ...s, status, isManualOverride: false, updatedAt: new Date() }
                : s
            ),
          };
        });
      },

      getMembersByStatus: (status) => {
        return get().statuses.filter((s) => s.status === status);
      },
    }),
    {
      name: 'bni-traffic-light-storage',
    }
  )
);
