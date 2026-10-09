import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ROLEPLAY_XP, type RoleplayScenarioId } from "@/types/roleplay";
import { LESSONS } from "@/data/lessons";

interface LearningState {
  xpToday: number;
  dailyGoal: number;
  streak: number;
  completedLessonIds: string[];
  activeLessonId: string | null;
  completedRoleplayIds: RoleplayScenarioId[];
  completeRoleplay: (scenarioId: RoleplayScenarioId) => void;
  addXP: (amount: number) => void;
  setDailyGoal: (goal: number) => void;
  completeLesson: (lessonId: string) => number;
  selectLesson: (lessonId: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      xpToday: 15,
      dailyGoal: 20,
      streak: 12,
      completedLessonIds: ["en-lesson-1", "en-lesson-2"],
      activeLessonId: "en-lesson-3",
      completedRoleplayIds: [],
      completeRoleplay: (scenarioId) => set((state) =>
        state.completedRoleplayIds.includes(scenarioId) ? state : {
          completedRoleplayIds: [...state.completedRoleplayIds, scenarioId],
          xpToday: state.xpToday + ROLEPLAY_XP,
        }),
      addXP: (amount) =>
        set((state) => ({
          xpToday: state.xpToday + amount,
        })),
      setDailyGoal: (goal) => {
        if (Number.isFinite(goal) && goal > 0) {
          set({ dailyGoal: goal });
        }
      },
      completeLesson: (lessonId) => {
        const lesson = LESSONS.find((item) => item.id === lessonId);
        const state = get();
        if (!lesson || state.completedLessonIds.includes(lessonId)) return 0;
        const completedLessonIds = [...state.completedLessonIds, lessonId];
        set({
          completedLessonIds,
          xpToday: state.xpToday + lesson.xpReward,
          activeLessonId: LESSONS.find((item) => !completedLessonIds.includes(item.id))?.id ?? lessonId,
        });
        return lesson.xpReward;
      },
      selectLesson: (lessonId) => set({ activeLessonId: lessonId }),
    }),
    {
      name: "learning-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
