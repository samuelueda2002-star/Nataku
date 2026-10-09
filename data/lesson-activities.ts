import type { Activity, VocabularyItem } from "@/types/learning";

/** A stable shuffle keeps answer positions varied without changing on re-render. */
function shuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createLessonActivities(
  lessonId: string,
  vocabulary: VocabularyItem[],
): Activity[] {
  const seed = Number(lessonId.split("-").at(-1)) || 1;
  const activities: Activity[] = vocabulary.map((item, index) => ({
    id: `${lessonId}-meaning-${index}`,
    type: "multiple-choice",
    question: "Choose the correct meaning",
    prompt: item.word,
    correctAnswer: item.translation,
    options: shuffle(
      [...new Set([item.translation, ...vocabulary.filter((other) => other.translation !== item.translation)
        .slice(0, 3).map((other) => other.translation)])],
      seed + index,
    ),
    hint: `Pronunciation: ${item.pronunciation}`,
  }));

  // Build actual vocabulary translations, including multi-word verbs and nouns.
  for (const [index, item] of vocabulary.slice(0, 2).entries()) {
    const distractors = vocabulary.filter((other) => other.word !== item.word && other.translation !== item.translation)
      .slice(0, 3).flatMap((other) => other.word.split(/\s+/));
    activities.push({
      id: `${lessonId}-translate-${index}`,
      type: "translate",
      question: "Translate into English",
      prompt: item.translation,
      correctAnswer: item.word,
      words: shuffle([...item.word.split(/\s+/), ...new Set(distractors)].slice(0, 12), seed + index + 31),
    });
  }

  for (let start = 0; start < vocabulary.length; start += 4) {
    // Identical meanings (e.g. Start / Begin) must not create ambiguous pairs.
    const items = vocabulary.slice(start, start + 4).filter((item, index, group) =>
      group.findIndex((other) => other.translation === item.translation) === index);
    if (items.length < 2) continue;
    activities.push({
      id: `${lessonId}-match-${start}`,
      type: "match",
      question: "Match the pairs",
      pairs: items.map((item, index) => ({
        id: `${start + index}`, word: item.word, translation: item.translation,
      })),
    });
  }
  return activities;
}

export function getMatchChoices(activity: Extract<Activity, { type: "match" }>) {
  return shuffle(activity.pairs, 41 + Number(activity.pairs[0]?.id ?? 0));
}
