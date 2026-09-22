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
      className={`min-h-[82px] flex-row items-center rounded-[18px] border px-5 py-3.5 ${
        isInProgress
          ? "border-[#7657FF] bg-[#FAF9FF]"
          : "border-[#ECEEF3] bg-white"
      }`}
      style={[styles.card, isInProgress && styles.cardInProgress]}
      testID={`lesson-card-${lesson.id}`}
      onPress={onPress}
    >
      <View className="flex-1 pr-3">
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

        {!isCompleted ? (
          <Text
            className={`mt-0.5 font-poppins text-[13px] leading-[19px] ${
              isInProgress ? "text-[#6445F5]" : "text-[#74809A]"
            }`}
          >
            {isInProgress
              ? "In progress"
              : `0 / ${lesson.activities.length} activities`}
          </Text>
        ) : null}
      </View>

      {isCompleted ? (
        <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-[#22C718]">
          <Ionicons name="checkmark" size={21} color="#FFFFFF" />
        </View>
      ) : isInProgress ? (
        <Image
          source={imageSource}
          className="h-[54px] w-[54px] rounded-[13px]"
          resizeMode="cover"
        />
      ) : (
        <Ionicons name="lock-closed-outline" size={24} color="#5C6885" />
      )}
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
