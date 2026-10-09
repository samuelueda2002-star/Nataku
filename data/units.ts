import type { Unit } from "@/types/learning";

function lessonIds(from: number, to: number): string[] {
  return Array.from(
    { length: to - from + 1 },
    (_, index) => `en-lesson-${from + index}`,
  );
}

export const UNITS: Unit[] = [
  {
    id: "en-unit-1",
    languageCode: "en",
    title: "Adjectives",
    description: "Emotions, personality, and physical traits",
    order: 1,
    lessonIds: lessonIds(1, 11),
  },
  {
    id: "en-unit-2",
    languageCode: "en",
    title: "Everyday Verbs",
    description: "Useful actions for daily conversations",
    order: 2,
    lessonIds: lessonIds(12, 21),
  },
  {
    id: "en-unit-3",
    languageCode: "en",
    title: "Parts of the House",
    description: "Rooms, furniture, tools, and household objects",
    order: 3,
    lessonIds: lessonIds(22, 39),
  },
  {
    id: "en-unit-4",
    languageCode: "en",
    title: "Phrasal Verbs",
    description: "Common two-word verbs for natural English",
    order: 4,
    lessonIds: lessonIds(40, 50),
  },
];
