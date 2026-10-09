import { LESSONS } from "@/data/lessons";
import { UNITS } from "@/data/units";
import type { LanguageCode, Lesson } from "@/types/learning";

export function getCourseLessons(language: LanguageCode | null): Lesson[] {
  return UNITS.filter((unit) => unit.languageCode === language)
    .sort((first, second) => first.order - second.order)
    .flatMap((unit) => unit.lessonIds.map((id) => LESSONS.find((lesson) => lesson.id === id)))
    .filter((lesson): lesson is Lesson => lesson !== undefined);
}

export function getPathStatus(lessonId: string, lessons: Lesson[], completedIds: string[]) {
  if (completedIds.includes(lessonId)) return "completed";
  return lessons.find((lesson) => !completedIds.includes(lesson.id))?.id === lessonId
    ? "current" : "locked";
}
