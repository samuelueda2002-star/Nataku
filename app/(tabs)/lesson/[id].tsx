import { AudioLessonScreen } from "@/components/audio-lesson-screen";
import { useLocalSearchParams } from "expo-router";

export default function AudioLessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <AudioLessonScreen lessonId={id} />;
}
