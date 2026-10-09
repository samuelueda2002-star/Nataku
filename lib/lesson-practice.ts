import type { Activity } from "@/types/learning";

export type MatchAnswers = Record<string, string>;

export function isActivityCorrect(
  activity: Activity,
  answer: string,
  matches: MatchAnswers,
): boolean {
  if (activity.type === "match") {
    return activity.pairs.every((pair) => matches[pair.id] === pair.id);
  }
  return answer.trim().toLocaleLowerCase() === activity.correctAnswer.trim().toLocaleLowerCase();
}

export function getCorrectAnswer(activity: Activity): string {
  return activity.type === "match"
    ? activity.pairs.map((pair) => `${pair.word} = ${pair.translation}`).join("\n")
    : activity.correctAnswer;
}
