import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

export default function SocialButton({ icon, label, onPress }: Props) {
  return (
    <TouchableOpacity
      className="h-[54px] flex-row items-center justify-center rounded-[17px] border border-[#E6EAF2] bg-white"
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View className="absolute left-9 w-7 items-center">{icon}</View>
      <Text className="text-center text-[15px] font-poppins-medium text-[#001328]">
        {label}
      </Text>
    </TouchableOpacity>
  );
}
