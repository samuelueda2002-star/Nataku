import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LANGUAGES } from "@/data/languages";
import { LESSONS } from "@/data/lessons";
import { useLanguageStore } from "@/store/languageStore";

export function AudioLessonScreen({ lessonId }: { lessonId?: string }) {
  const router = useRouter();
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const lesson = LESSONS.find((candidate) => candidate.id === lessonId);
  const language = LANGUAGES.find(
    (candidate) => candidate.code === selectedLanguage,
  );

  return (
    <SafeAreaView style={{ backgroundColor: "#FFFFFF", flex: 1 }}>
      <View className="flex-1 items-center justify-center bg-white px-8">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-[#EEEAFE]">
          <Ionicons name="headset" size={36} color="#5B3BF6" />
        </View>
        <Text className="mt-6 text-center font-poppins-semibold text-[22px] text-text-primary">
          {lesson?.title ?? "Audio lesson"}
        </Text>
        <Text className="mt-2 text-center font-poppins text-[14px] leading-[22px] text-[#65708D]">
          {language?.name ?? "Language"} audio calls use native microphone and
          WebRTC features. Open this lesson in the iOS or Android development
          build to join your AI teacher.
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          className="mt-7 rounded-full bg-lingua-purple px-6 py-3.5"
          onPress={() => router.back()}
        >
          <Text className="font-poppins-medium text-[14px] text-white">
            Back to lessons
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
