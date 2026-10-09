import { AudioLessonScreen } from "@/components/audio-lesson-screen";
import { PracticeLessonScreen } from "@/components/practice-lesson-screen";
import { useLocalSearchParams } from "expo-router";

export default function LessonRoute() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();

  return mode === "audio" ? <AudioLessonScreen lessonId={id} /> : <PracticeLessonScreen lessonId={id} />;
}
