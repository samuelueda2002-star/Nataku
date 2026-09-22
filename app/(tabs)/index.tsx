import { HomePlanItem } from "@/components/home-plan-item";
import { images } from "@/constants/images";
import { LANGUAGES } from "@/data/languages";
import { LESSONS } from "@/data/lessons";
import { UNITS } from "@/data/units";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUser();
  const selectedLanguage = useLanguageStore(
    (state) => state.selectedLanguage,
  );
  const { xpToday, dailyGoal, streak, completedLessonIds } =
    useLearningStore();

  const language = useMemo(
    () =>
      LANGUAGES.find((item) => item.code === selectedLanguage) ?? LANGUAGES[0],
    [selectedLanguage],
  );

  const unit = useMemo(
    () =>
      UNITS.find((item) => item.languageCode === language.code) ?? UNITS[0],
    [language.code],
  );

  const unitLessons = useMemo(
    () =>
      unit.lessonIds
        .map((lessonId) => LESSONS.find((lesson) => lesson.id === lessonId))
        .filter((lesson) => lesson !== undefined),
    [unit.lessonIds],
  );

  const currentLesson =
    unitLessons.find((lesson) => !completedLessonIds.includes(lesson.id)) ??
    unitLessons.at(-1);

  if (!currentLesson) return null;

  const firstName =
    user?.firstName ??
    user?.fullName?.split(" ")[0] ??
    user?.primaryEmailAddress?.emailAddress.split("@")[0] ??
    "Learner";
  const goalProgress = dailyGoal > 0 ? Math.min(xpToday / dailyGoal, 1) : 0;
  const lessonPlanComplete =
    completedLessonIds.includes(currentLesson.id) ||
    xpToday >= currentLesson.xpReward;

  const openCurrentLesson = () => {
    router.push(`/lesson/${currentLesson.id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View className="flex-row items-center px-6 pb-7 pt-7">
          <Image
            source={{ uri: language.flag }}
            className="h-10 w-10 rounded-full border border-[#E7E9EF]"
          />
          <Text
            className="ml-3 flex-1 font-poppins-semibold text-[18px] leading-[25px] text-text-primary"
            numberOfLines={1}
          >
            Hello, {firstName}! 👋
          </Text>

          <View className="flex-row items-center">
            <Image
              source={images.streakFire}
              className="h-10 w-10"
              resizeMode="contain"
            />
            <Text className="ml-1 font-poppins-medium text-[17px] text-[#65708E]">
              {streak}
            </Text>
            <TouchableOpacity
              className="ml-5 h-10 w-10 items-end justify-center"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Ionicons
                name="notifications-outline"
                size={27}
                color="#1F2C4D"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6">
          <View className="h-[128px] overflow-hidden rounded-[22px] bg-[#FFF8EF] px-5 py-4">
            <Text className="font-poppins-medium text-[16px] leading-[23px] text-[#263451]">
              Daily goal
            </Text>

            <View className="mt-1 flex-row items-baseline">
              <Text className="font-poppins-semibold text-[28px] leading-[38px] text-[#13223F]">
                {xpToday}
              </Text>
              <Text className="ml-2 font-poppins text-[16px] text-[#71809F]">
                / {dailyGoal} XP
              </Text>
            </View>

            <View className="mt-3 h-2 w-[62%] overflow-hidden rounded-full bg-[#FFE4C7]">
              <View
                className="h-full rounded-full bg-[#FF720D]"
                style={{ width: `${goalProgress * 100}%` }}
              />
            </View>

            <Image
              source={images.treasure}
              className="absolute right-4 top-3 h-[100px] w-[100px]"
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity
            className="mt-5 h-[178px] overflow-hidden rounded-[22px] bg-[#6748F8] px-5 py-5"
            style={styles.learningCard}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={`Continue ${language.name}, ${unit.title}`}
            onPress={openCurrentLesson}
          >
            <View className="absolute -bottom-10 left-[94px] h-[105px] w-[105px] rotate-45 rounded-[26px] bg-[#4B39D6]/40" />
            <View className="absolute -right-10 top-3 h-[105px] w-[105px] rotate-45 rounded-[28px] bg-white/5" />

            <Text className="font-poppins text-[16px] leading-[22px] text-white/90">
              Continue learning
            </Text>
            <Text className="mt-1 font-poppins-semibold text-[26px] leading-[34px] text-white">
              {language.name}
            </Text>
            <Text className="font-poppins text-[17px] leading-[24px] text-white/90">
              A1 • Unit {unit.order}
            </Text>

            <View className="mt-4 h-[44px] w-[106px] items-center justify-center rounded-[14px] bg-white">
              <Text className="font-poppins-semibold text-[15px] text-[#6647F5]">
                Continue
              </Text>
            </View>

            <Image
              source={images.palace}
              className="absolute -bottom-2 -right-5 h-[181px] w-[196px]"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View className="flex-row items-center pb-1 pt-6">
            <Text className="flex-1 font-poppins-semibold text-[18px] leading-[26px] text-text-primary">
              Today&apos;s plan
            </Text>
            <TouchableOpacity
              className="h-10 justify-center pl-5"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View all lessons"
              onPress={() => router.push("/(tabs)/learn")}
            >
              <Text className="font-poppins-medium text-[15px] text-[#6445F5]">
                View all
              </Text>
            </TouchableOpacity>
          </View>

          <HomePlanItem
            title="Lesson"
            subtitle={currentLesson.title}
            icon="book"
            iconBackground="#6748F8"
            isComplete={lessonPlanComplete}
            onPress={openCurrentLesson}
          />
          <HomePlanItem
            title="AI Conversation"
            subtitle="Talk about your day"
            icon="headset"
            iconBackground="#6748F8"
            onPress={() => router.push("/(tabs)/chat")}
          />
          <HomePlanItem
            title="New words"
            subtitle={`${currentLesson.vocabulary.length} words`}
            icon="chatbubbles"
            iconBackground="#FF5B63"
            onPress={openCurrentLesson}
          />

          <TouchableOpacity
            className="mt-4 h-[116px] flex-row items-center overflow-hidden rounded-[22px] bg-[#F4FBEA] px-5"
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Start AI video call"
            onPress={() => router.push("/(tabs)/ai-teacher")}
          >
            <View className="flex-1">
              <Text className="font-poppins text-[13px] leading-[20px] text-[#6D7995]">
                Next up
              </Text>
              <Text className="font-poppins-semibold text-[18px] leading-[27px] text-text-primary">
                AI Video Call
              </Text>
              <Text className="font-poppins text-[13px] leading-[20px] text-[#6D7995]">
                Practice speaking
              </Text>
            </View>

            <View className="h-[82px] w-[82px] overflow-hidden rounded-full bg-[#E7F2D9]">
              <Image
                source={images.aiTeacher}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
            <View className="ml-3 h-[46px] w-[46px] items-center justify-center rounded-full bg-[#48C816]">
              <Ionicons name="videocam" size={25} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
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
  learningCard: {
    experimental_backgroundImage:
      "linear-gradient(120deg, #5639F5 0%, #7048F4 62%, #8557F4 100%)",
  },
});
