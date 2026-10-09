import { ProfileAchievements } from "@/components/profile-achievements";
import { ProfileDailyGoal } from "@/components/profile-daily-goal";
import { ProfileOverview } from "@/components/profile-overview";
import { LANGUAGES } from "@/data/languages";
import { LESSONS } from "@/data/lessons";
import { UNITS } from "@/data/units";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const { xpToday, dailyGoal, streak, completedLessonIds, setDailyGoal } =
    useLearningStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const language =
    LANGUAGES.find((item) => item.code === selectedLanguage) ?? LANGUAGES[0];
  const languageLessonIds = new Set(
    UNITS.filter((unit) => unit.languageCode === language.code).flatMap(
      (unit) => unit.lessonIds,
    ),
  );
  const courseLessons = LESSONS.filter((lesson) =>
    languageLessonIds.has(lesson.id),
  );
  const completedLessons = courseLessons.filter((lesson) =>
    completedLessonIds.includes(lesson.id),
  ).length;
  const courseProgress = courseLessons.length
    ? Math.round((completedLessons / courseLessons.length) * 100)
    : 0;
  const name =
    user?.fullName?.trim() ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress.split("@")[0] ||
    "Learner";

  const handleSignOut = () => {
    Alert.alert("Sign out?", "You can sign back in whenever you're ready.", [
      { text: "Stay here", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          setIsSigningOut(true);
          try {
            await signOut();
          } catch {
            setIsSigningOut(false);
            Alert.alert("Couldn't sign out", "Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <Text className="font-poppins-bold text-[28px] leading-[38px] text-text-primary">
            Your profile
          </Text>
          <Text className="profile__muted mt-1">Small steps. Real progress.</Text>
        </View>

        <ProfileOverview
          name={name}
          imageUrl={user?.hasImage ? user.imageUrl : undefined}
          joinedAt={user?.createdAt}
          streak={streak}
          completedLessons={completedLessons}
          xpToday={xpToday}
        />

        <Text className="profile__heading mb-3 mt-7">Your learning journey</Text>
        <TouchableOpacity
          className="profile__card border-[#E6DFFF] bg-[#F7F4FF]"
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`${language.name} course, ${completedLessons} of ${courseLessons.length} lessons completed. View lessons`}
          onPress={() => router.push("/(tabs)/learn")}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-white">
              <Image source={{ uri: language.flag }} className="h-9 w-9 rounded-full" />
            </View>
            <View className="flex-1">
              <Text className="font-poppins-semibold text-[18px] text-text-primary">
                {language.name}
              </Text>
              <Text className="profile__muted">{language.learners} course</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6C4EF5" />
          </View>
          <View className="mb-2 mt-5 flex-row items-center justify-between gap-2">
            <Text className="font-poppins-medium text-[12px] text-[#655B88]">
              {completedLessons} of {courseLessons.length} lessons completed
            </Text>
            <Text className="font-poppins-semibold text-[12px] text-lingua-purple">
              {courseProgress}%
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-[#E6DFFF]">
            <View
              className="h-full rounded-full bg-lingua-purple"
              style={{ width: `${courseProgress}%` }}
            />
          </View>
        </TouchableOpacity>

        <ProfileAchievements completedLessons={completedLessons} streak={streak} />

        <ProfileDailyGoal
          xpToday={xpToday}
          dailyGoal={dailyGoal}
          onGoalChange={setDailyGoal}
        />

        <Text className="profile__heading mb-3 mt-7">Account</Text>
        <View className="profile__card">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface">
              <Ionicons name="mail-outline" size={21} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="font-poppins-medium text-[13px] text-text-primary">Email address</Text>
              <Text selectable className="profile__muted mt-0.5">
                {user?.primaryEmailAddress?.emailAddress ?? "No email address linked"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="mt-4 min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-[#FFF2F2] px-4 py-3"
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
            activeOpacity={0.7}
            disabled={isSigningOut}
            onPress={handleSignOut}
          >
            {isSigningOut ? (
              <ActivityIndicator color="#D94444" />
            ) : (
              <Ionicons name="log-out-outline" size={21} color="#D94444" />
            )}
            <Text className="font-poppins-semibold text-[14px] text-[#D94444]">
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="profile__muted mt-5 text-center">Keep showing up. You&apos;ve got this.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 28 },
});
