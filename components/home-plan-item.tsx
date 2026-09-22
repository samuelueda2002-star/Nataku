import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface HomePlanItemProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBackground: string;
  isComplete?: boolean;
  onPress: () => void;
}

export function HomePlanItem({
  title,
  subtitle,
  icon,
  iconBackground,
  isComplete = false,
  onPress,
}: HomePlanItemProps) {
  return (
    <TouchableOpacity
      className="min-h-[70px] flex-row items-center"
      activeOpacity={0.72}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}`}
      onPress={onPress}
    >
      <View
        className="h-[46px] w-[46px] items-center justify-center rounded-[13px]"
        style={{ backgroundColor: iconBackground }}
      >
        <Ionicons name={icon} size={25} color="#FFFFFF" />
      </View>

      <View className="ml-4 flex-1">
        <Text className="font-poppins-medium text-[16px] leading-[23px] text-text-primary">
          {title}
        </Text>
        <Text
          className="font-poppins text-[14px] leading-[21px] text-[#76809B]"
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      <View
        className={`h-[27px] w-[27px] items-center justify-center rounded-full border-2 ${
          isComplete
            ? "border-lingua-purple bg-lingua-purple"
            : "border-[#8290B0] bg-white"
        }`}
      >
        {isComplete ? (
          <Ionicons name="checkmark" size={17} color="#FFFFFF" />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
