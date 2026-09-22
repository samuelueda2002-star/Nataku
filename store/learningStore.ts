import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LearningState {
  xpToday: number;
  dailyGoal: number;
  streak: number;
  completedLessonIds: string[];
  activeLessonId: string | null;
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  selectLesson: (lessonId: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      xpToday: 15,
      dailyGoal: 20,
      streak: 12,
      completedLessonIds: ["en-lesson-1", "en-lesson-2"],
      activeLessonId: "en-lesson-3",
      addXP: (amount) =>
        set((state) => ({
          xpToday: Math.min(state.xpToday + amount, state.dailyGoal),
        })),
      completeLesson: (lessonId) =>
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds
            : [...state.completedLessonIds, lessonId],
        })),
      selectLesson: (lessonId) => set({ activeLessonId: lessonId }),
    }),
    {
      name: "learning-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
