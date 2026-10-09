export type LanguageCode = "en";

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  color: string;
  learners: string;
}

interface ActivityBase {
  id: string;
  question: string;
  hint?: string;
}

export interface ChoiceActivity extends ActivityBase {
  type: "multiple-choice" | "vocabulary";
  prompt: string;
  correctAnswer: string;
  options: string[];
}

export interface TranslationActivity extends ActivityBase {
  type: "translate";
  prompt: string;
  correctAnswer: string;
  words: string[];
}

export interface MatchActivity extends ActivityBase {
  type: "match";
  pairs: { id: string; word: string; translation: string }[];
}

export type Activity = ChoiceActivity | TranslationActivity | MatchActivity;

export interface VocabularyItem {
  word: string;
  translation: string;
  pronunciation: string;
  emoji?: string;
}

export interface Phrase {
  text: string;
  translation: string;
  pronunciation: string;
}

export interface LessonGoal {
  description: string;
  xpReward: number;
}

export interface AITeacherPrompt {
  systemPrompt: string;
  introMessage: string;
  topics: string[];
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  goals: LessonGoal[];
  vocabulary: VocabularyItem[];
  phrases: Phrase[];
  activities: Activity[];
  aiTeacherPrompt: AITeacherPrompt;
}

export interface Unit {
  id: string;
  languageCode: LanguageCode;
  title: string;
  description: string;
  order: number;
  lessonIds: string[];
}
