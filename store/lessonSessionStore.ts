import { create } from "zustand";

import { isActivityCorrect, type MatchAnswers } from "@/lib/lesson-practice";
import type { Activity, Lesson } from "@/types/learning";

interface LessonSession {
  lessonId: string | null;
  activities: Activity[];
  queue: number[];
  position: number;
  hearts: number;
  answer: string;
  selectedWords: number[];
  matches: MatchAnswers;
  feedback: "correct" | "incorrect" | null;
  status: "playing" | "completed" | "failed";
  attempts: number;
  correctCount: number;
  mastered: number[];
  start: (lesson: Lesson) => void;
  choose: (answer: string) => void;
  toggleWord: (index: number) => void;
  pair: (leftId: string, rightId: string) => void;
  check: () => void;
  advance: () => void;
}

// Only completion and XP persist. An unfinished exercise session starts fresh.
export const useLessonSessionStore = create<LessonSession>((set, get) => ({
  lessonId: null, activities: [], queue: [], position: 0, hearts: 5,
  answer: "", selectedWords: [], matches: {}, feedback: null,
  status: "playing", attempts: 0, correctCount: 0, mastered: [],
  start: (lesson) => set({
    lessonId: lesson.id, activities: lesson.activities,
    queue: lesson.activities.map((_, index) => index), position: 0,
    hearts: 5, answer: "", selectedWords: [], matches: {}, feedback: null,
    status: "playing", attempts: 0, correctCount: 0, mastered: [],
  }),
  choose: (answer) => {
    if (get().feedback || get().status !== "playing") return;
    set({ answer });
  },
  toggleWord: (index) => {
    const state = get();
    const activity = state.activities[state.queue[state.position]];
    if (state.feedback || state.status !== "playing" || activity?.type !== "translate") return;
    if (index < 0 || index >= activity.words.length) return;
    const selectedWords = state.selectedWords.includes(index)
      ? state.selectedWords.filter((item) => item !== index)
      : [...state.selectedWords, index];
    set({ selectedWords, answer: selectedWords.map((item) => activity.words[item]).join(" ") });
  },
  pair: (leftId, rightId) => {
    const state = get();
    const activity = state.activities[state.queue[state.position]];
    if (state.feedback || state.status !== "playing" || activity?.type !== "match") return;
    if (!activity.pairs.some((item) => item.id === leftId) || !activity.pairs.some((item) => item.id === rightId)) return;
    const matches = Object.fromEntries(Object.entries(state.matches)
      .filter(([left, right]) => left !== leftId && right !== rightId));
    set({ matches: { ...matches, [leftId]: rightId } });
  },
  check: () => {
    const state = get();
    const activityIndex = state.queue[state.position];
    const activity = state.activities[activityIndex];
    if (!activity || state.feedback || state.status !== "playing") return;
    if (activity.type === "match"
      ? activity.pairs.some((item) => !state.matches[item.id])
      : !state.answer.trim()) return;
    const correct = isActivityCorrect(activity, state.answer, state.matches);
    set({
      feedback: correct ? "correct" : "incorrect", attempts: state.attempts + 1,
      correctCount: state.correctCount + (correct ? 1 : 0),
      hearts: state.hearts - (correct ? 0 : 1),
      queue: correct ? state.queue : [...state.queue, activityIndex],
      mastered: correct && !state.mastered.includes(activityIndex)
        ? [...state.mastered, activityIndex] : state.mastered,
    });
  },
  advance: () => {
    const state = get();
    if (!state.feedback || state.status !== "playing") return;
    const status = state.hearts === 0 ? "failed"
      : state.position + 1 === state.queue.length ? "completed" : "playing";
    set({ status, position: state.position + 1, answer: "", selectedWords: [], matches: {}, feedback: null });
  },
}));
