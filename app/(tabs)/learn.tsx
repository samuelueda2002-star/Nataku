import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LearningPath } from "@/components/learning-path";
import { getCourseLessons } from "@/lib/learning-path";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";

export default function LearnScreen() {
  const language = useLanguageStore((state) => state.selectedLanguage);
  const { completedLessonIds, selectLesson, streak, xpToday } = useLearningStore();
  const lessons = getCourseLessons(language);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["top"]}>
      <View className="flex-row items-center justify-between border-b-2 border-[#E5E5E5] px-5 py-4">
        <View>
          <Text className="font-poppins-bold text-xl text-[#4B4B4B]">Your English path</Text>
          <Text className="mt-1 font-poppins text-xs text-[#888888]">One small win at a time</Text>
        </View>
        <View className="items-end gap-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="flame" size={21} color="#FF9600" />
            <Text className="font-poppins-bold text-sm text-[#FF9600]">{streak}</Text>
          </View>
          <Text className="font-poppins-semibold text-xs text-[#58A700]">{xpToday} XP</Text>
        </View>
      </View>
      {lessons.length ? (
        <LearningPath lessons={lessons} completedIds={completedLessonIds} selectLesson={selectLesson} />
      ) : (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text className="text-center font-poppins-semibold text-xl text-text-primary">Choose a language to start</Text>
          <Text className="text-center font-poppins text-sm text-text-secondary">Your lessons will appear here after you select English.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
