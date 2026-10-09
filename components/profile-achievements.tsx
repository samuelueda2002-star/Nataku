import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type ProfileAchievementsProps = {
  completedLessons: number;
  streak: number;
};

export function ProfileAchievements({
  completedLessons,
  streak,
}: ProfileAchievementsProps) {
  const achievements = [
    {
      title: "First steps",
      description: "1 lesson",
      icon: "footsteps" as const,
      value: completedLessons,
      target: 1,
      color: "#6C4EF5",
      background: "bg-[#EEE7FF]",
    },
    {
      title: "On a roll",
      description: "7-day streak",
      icon: "flame" as const,
      value: streak,
      target: 7,
      color: "#FF8A00",
      background: "bg-[#FFF0DD]",
    },
    {
      title: "Explorer",
      description: "10 lessons",
      icon: "compass" as const,
      value: completedLessons,
      target: 10,
      color: "#21A967",
      background: "bg-[#E7F7EE]",
    },
  ];
  const unlockedCount = achievements.filter(
    (item) => item.value >= item.target,
  ).length;

  return (
    <View className="mt-7">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="profile__heading">Milestones</Text>
        <Text className="profile__muted">{unlockedCount} of {achievements.length} earned</Text>
      </View>
      <View className="flex-row gap-2">
        {achievements.map((achievement) => {
          const unlocked = achievement.value >= achievement.target;
          return (
            <View
              key={achievement.title}
              className="flex-1 items-center rounded-[20px] border border-[#EEEAF5] bg-white px-1 py-4"
              accessible
              accessibilityLabel={`${achievement.title}: ${achievement.description}. ${unlocked ? "Earned" : `${achievement.value} of ${achievement.target}`}`}
            >
              <View className={`h-12 w-12 items-center justify-center rounded-2xl ${unlocked ? achievement.background : "bg-[#F0F1F5]"}`}>
                <Ionicons name={achievement.icon} size={26} color={unlocked ? achievement.color : "#A5ABBA"} />
              </View>
              <Text className="mt-3 text-center font-poppins-semibold text-[11px] text-text-primary">{achievement.title}</Text>
              <Text className="mt-1 text-center font-poppins text-[10px] text-text-secondary">{achievement.description}</Text>
              <View className="mt-2 flex-row items-center gap-1">
                <Ionicons name={unlocked ? "checkmark-circle" : "lock-closed"} size={12} color={unlocked ? "#21A967" : "#9CA3AF"} />
                <Text className={`font-poppins-medium text-[10px] ${unlocked ? "text-[#218554]" : "text-text-secondary"}`}>
                  {unlocked ? "Earned" : `${Math.min(achievement.value, achievement.target)}/${achievement.target}`}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
