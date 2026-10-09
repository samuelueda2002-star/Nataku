import { Ionicons } from "@expo/vector-icons";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Lesson } from "@/types/learning";

export type LessonStatus = "completed" | "in-progress" | "not-started";

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  imageSource: ImageSourcePropType;
  status: LessonStatus;
  onPress: () => void;
}

export function LessonCard({
  lesson,
  index,
  imageSource,
  status,
  onPress,
}: LessonCardProps) {
  const isCompleted = status === "completed";
  const isInProgress = status === "in-progress";
  const statusLabel = isCompleted
    ? "Completed"
    : isInProgress
      ? "In progress"
      : "Available";

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`Lesson ${index + 1}, ${lesson.title}, ${
        isCompleted
          ? "completed"
          : isInProgress
            ? "in progress"
            : "not started, available"
      }`}
      className={`min-h-[92px] flex-row items-center rounded-[18px] border p-3 ${
        isInProgress
          ? "border-[#7657FF] bg-[#FAF9FF]"
          : isCompleted
            ? "border-[#CDEFD2] bg-[#FBFFFC]"
          : "border-[#ECEEF3] bg-white"
      }`}
      style={[styles.card, isInProgress && styles.cardInProgress]}
      testID={`lesson-card-${lesson.id}`}
      onPress={onPress}
    >
      <View className="relative h-[64px] w-[64px] overflow-hidden rounded-[15px] bg-[#EEF0F5]">
        <Image
          source={imageSource}
          className="h-full w-full"
          resizeMode="cover"
          accessibilityLabel={`${lesson.title} lesson image`}
        />
        {isCompleted ? (
          <View className="absolute bottom-1 right-1 h-[23px] w-[23px] items-center justify-center rounded-full bg-[#22C718]">
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        ) : null}
      </View>

      <View className="min-w-0 flex-1 px-3">
        <Text
          className={`font-poppins-medium text-[13px] leading-[20px] ${
            isInProgress ? "text-[#6445F5]" : "text-[#73809C]"
          }`}
        >
          Lesson {index + 1}
        </Text>

        <Text
          className="mt-1 font-poppins-medium text-[17px] leading-[24px] text-text-primary"
          numberOfLines={1}
        >
          {lesson.title}
        </Text>

        <Text className="mt-0.5 font-poppins text-[12px] leading-[18px] text-[#74809A]">
          {lesson.vocabulary.length} words • {lesson.xpReward} XP
        </Text>
      </View>

      <View
        className={`rounded-full px-2.5 py-1 ${
          isCompleted
            ? "bg-[#E7F8EA]"
            : isInProgress
              ? "bg-[#EEEAFE]"
              : "bg-[#F0F2F6]"
        }`}
      >
        <Text
          className={`font-poppins-medium text-[10px] ${
            isCompleted
              ? "text-[#168A31]"
              : isInProgress
                ? "text-[#6445F5]"
                : "text-[#66718B]"
          }`}
        >
          {statusLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderCurve: "continuous",
    boxShadow: "0 1px 2px rgba(27, 39, 76, 0.025)",
  },
  cardInProgress: {
    borderWidth: 1.5,
    boxShadow: "0 2px 8px rgba(108, 78, 245, 0.08)",
  },
});
