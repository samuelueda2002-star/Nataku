import { LessonCard, type LessonStatus } from "@/components/LessonCard";
import { images, lessonImages } from "@/constants/images";
import { LESSONS } from "@/data/lessons";
import { UNITS } from "@/data/units";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";
import type { Lesson } from "@/types/learning";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getLessonImage(lessonId: string): ImageSourcePropType {
  return (
    lessonImages[lessonId as keyof typeof lessonImages] ??
    images.lessonFallback
  );
}

export default function LearnScreen() {
  const selectedLanguage = useLanguageStore(
    (state) => state.selectedLanguage,
  );
  const completedLessonIds = useLearningStore(
    (state) => state.completedLessonIds,
  );
  const activeLessonId = useLearningStore((state) => state.activeLessonId);
  const selectLesson = useLearningStore((state) => state.selectLesson);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  const languageUnits = useMemo(
    () =>
      UNITS.filter((unit) => unit.languageCode === selectedLanguage).sort(
        (first, second) => first.order - second.order,
      ),
    [selectedLanguage],
  );

  const lessons = useMemo(
    () =>
      languageUnits.flatMap((unit) =>
        unit.lessonIds
          .map((lessonId) => LESSONS.find((lesson) => lesson.id === lessonId))
          .filter((lesson): lesson is Lesson => lesson !== undefined),
      ),
    [languageUnits],
  );

  const activeLesson =
    lessons.find((lesson) => lesson.id === activeLessonId) ??
    lessons.find((lesson) => !completedLessonIds.includes(lesson.id)) ??
    lessons[0];

  const activeUnit = languageUnits.find(
    (unit) => unit.id === activeLesson?.unitId,
  );
  const activeLessonIndex = lessons.findIndex(
    (lesson) => lesson.id === activeLesson?.id,
  );

  const openLesson = (lessonId: string) => {
    selectLesson(lessonId);
    setHeroImageFailed(false);
    router.push(`/lesson/${lessonId}`);
  };

  const getLessonStatus = (lessonId: string): LessonStatus => {
    if (completedLessonIds.includes(lessonId)) return "completed";
    if (lessonId === activeLesson?.id) return "in-progress";
    return "not-started";
  };

  if (!activeLesson || !activeUnit) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-poppins-semibold text-[20px] text-text-primary">
            Lessons are coming soon
          </Text>
          <Text className="mt-2 text-center font-poppins text-[14px] leading-[22px] text-text-secondary">
            We could not find learning content for your selected language.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const heroImage = heroImageFailed
    ? images.lessonFallback
    : getLessonImage(activeLesson.id);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View className="h-[84px] flex-row items-center px-5">
          <TouchableOpacity
            className="h-12 w-11 items-start justify-center"
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go to home"
            onPress={() => router.navigate("/(tabs)")}
          >
            <Ionicons name="chevron-back" size={31} color="#06162E" />
          </TouchableOpacity>

          <View className="flex-1 px-2">
            <Text
              className="font-poppins-semibold text-[21px] leading-[28px] text-text-primary"
              numberOfLines={1}
            >
              {activeLesson.title}
            </Text>
            <Text className="mt-1 font-poppins text-[15px] leading-[22px] text-[#65708D]">
              Unit {activeUnit.order} • {activeLessonIndex + 1} / {lessons.length}{" "}
              lessons
            </Text>
          </View>

          <TouchableOpacity
            className="h-12 w-11 items-end justify-center"
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              isBookmarked ? "Remove lesson bookmark" : "Bookmark lesson"
            }
            accessibilityState={{ selected: isBookmarked }}
            onPress={() => setIsBookmarked((bookmarked) => !bookmarked)}
          >
            <View className="items-center">
              <View className="mb-[-8px] h-2.5 w-5 rounded-t-[3px] bg-[#FF930F]" />
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={31}
                color={isBookmarked ? "#6548F5" : "#52617F"}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View className="h-[218px] overflow-hidden bg-[#EEF5F7]">
          <Image
            source={heroImage}
            className="h-full w-full"
            resizeMode="cover"
            accessibilityLabel={`${activeLesson.title} lesson artwork`}
            onError={() => setHeroImageFailed(true)}
          />
          <View className="absolute inset-x-0 bottom-0 h-16 bg-white/10" />
        </View>

        <View
          className="mx-[18px] -mt-[18px] h-[64px] flex-row overflow-hidden rounded-[19px] bg-[#F8F7FB]"
          style={styles.segmentedControl}
        >
          <View className="flex-1 items-center justify-center rounded-[18px] bg-white">
            <Text className="font-poppins-medium text-[17px] text-[#563CF3]">
              Lessons
            </Text>
            <View className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-[#5D3CF5]" />
          </View>
          <TouchableOpacity
            className="flex-1 items-center justify-center"
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: false }}
            accessibilityLabel="Practice"
          >
            <Text className="font-poppins-medium text-[17px] text-[#606B86]">
              Practice
            </Text>
          </TouchableOpacity>
        </View>

        <View className="gap-2.5 px-5 pb-3 pt-6">
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              imageSource={getLessonImage(lesson.id)}
              status={getLessonStatus(lesson.id)}
              onPress={() => openLesson(lesson.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 22,
  },
  segmentedControl: {
    zIndex: 2,
    borderCurve: "continuous",
    boxShadow: "0 5px 18px rgba(23, 33, 61, 0.10)",
  },
});
