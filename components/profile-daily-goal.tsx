import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const DAILY_GOALS = [
  { xp: 10, label: "Casual" },
  { xp: 20, label: "Regular" },
  { xp: 30, label: "Focused" },
];

type ProfileDailyGoalProps = {
  xpToday: number;
  dailyGoal: number;
  onGoalChange: (goal: number) => void;
};

export function ProfileDailyGoal({
  xpToday,
  dailyGoal,
  onGoalChange,
}: ProfileDailyGoalProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const goalProgress = dailyGoal > 0 ? Math.min(xpToday / dailyGoal, 1) : 0;

  return (
    <View>
      <View className="mb-3 mt-7 flex-row items-center justify-between">
        <Text className="profile__heading">Daily goal</Text>
        <TouchableOpacity
          className="min-h-11 min-w-11 items-end justify-center pl-3"
          accessibilityRole="button"
          accessibilityLabel={isEditingGoal ? "Close daily goal options" : "Edit daily goal"}
          accessibilityState={{ expanded: isEditingGoal }}
          onPress={() => setIsEditingGoal((value) => !value)}
        >
          <Text className="font-poppins-semibold text-[13px] text-lingua-purple">
            {isEditingGoal ? "Done" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>
      <View className="profile__card">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4E6]">
            <Ionicons name="flag" size={23} color="#FF8A00" />
          </View>
          <View className="flex-1">
            <Text className="font-poppins-semibold text-[16px] text-text-primary">
              {xpToday} / {dailyGoal} XP
            </Text>
            <Text className="profile__muted">
              {goalProgress >= 1 ? "Goal reached. Nice work!" : "A little practice goes a long way."}
            </Text>
          </View>
          {goalProgress >= 1 && <Ionicons name="checkmark-circle" size={25} color="#21C16B" />}
        </View>
        <View className="mt-4 h-2 overflow-hidden rounded-full bg-[#FFF0DE]">
          <View
            className="h-full rounded-full bg-streak"
            style={{ width: `${goalProgress * 100}%` }}
          />
        </View>
        {isEditingGoal && (
          <View className="mt-5">
            <Text className="profile__muted mb-3">Choose your pace. Saved on this device.</Text>
            <View className="flex-row gap-2">
              {DAILY_GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.xp}
                  className={`flex-1 items-center rounded-2xl border px-1 py-3 ${dailyGoal === goal.xp
                      ? "border-lingua-purple bg-[#F3EFFF]"
                      : "border-border bg-white"
                    }`}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityLabel={`${goal.label}, ${goal.xp} XP per day`}
                  accessibilityState={{ selected: dailyGoal === goal.xp }}
                  onPress={() => onGoalChange(goal.xp)}
                >
                  <Text className="font-poppins-semibold text-[14px] text-text-primary">{goal.xp} XP</Text>
                  <Text className="profile__muted mt-1">{goal.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
