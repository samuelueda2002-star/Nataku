import { images } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

type ProfileOverviewProps = {
  name: string;
  imageUrl?: string;
  joinedAt?: Date | null;
  streak: number;
  completedLessons: number;
  xpToday: number;
};

export function ProfileOverview({
  name,
  imageUrl,
  joinedAt,
  streak,
  completedLessons,
  xpToday,
}: ProfileOverviewProps) {
  return (
    <View className="overflow-hidden rounded-[28px] border border-[#ECE7FB] bg-[#FBF9FF]">
      <View className="h-20 overflow-hidden bg-[#EEE7FF]">
        <View className="absolute -right-6 -top-14 h-36 w-36 rounded-full bg-[#E2D6FF]" />
        <View className="absolute -bottom-10 left-7 h-20 w-20 rounded-full bg-[#E2D6FF]" />
        <View className="absolute right-28 top-5">
          <Ionicons name="sparkles" size={24} color="#B69AEF" />
        </View>
      </View>
      <View className="items-center px-4 pb-5">
        <View className="-mt-12 h-24 w-24 items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-[#E8DEFF]">
          <Image
            source={imageUrl ? { uri: imageUrl } : images.mascotLogo}
            className="h-full w-full"
            resizeMode="cover"
            accessibilityLabel={`${name}'s avatar`}
          />
        </View>
        <Text selectable className="mt-3 text-center font-poppins-semibold text-[23px] leading-[32px] text-text-primary">
          {name}
        </Text>
        {joinedAt && (
          <Text className="profile__muted mt-1 text-center">
            Joined {joinedAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </Text>
        )}
        <View className="mt-3 flex-row items-center gap-1.5 rounded-full bg-[#EEE7FF] px-3 py-1.5">
          <Ionicons name="sparkles" size={13} color="#6C4EF5" />
          <Text className="font-poppins-medium text-[11px] text-lingua-purple">Every day is a new chapter</Text>
        </View>
      </View>
      <View className="flex-row border-t border-[#ECE7FB] bg-white py-5">
        <View className="flex-1 items-center px-1">
          <Ionicons name="flame" size={23} color="#FF8A00" />
          <Text selectable className="mt-1 font-poppins-bold text-[22px] text-text-primary">{streak}</Text>
          <Text className="profile__muted text-center">Day streak</Text>
        </View>
        <View className="flex-1 items-center border-x border-[#F0EDF7] px-1">
          <Ionicons name="checkmark-circle" size={23} color="#21C16B" />
          <Text selectable className="mt-1 font-poppins-bold text-[22px] text-text-primary">{completedLessons}</Text>
          <Text className="profile__muted text-center">Lessons</Text>
        </View>
        <View className="flex-1 items-center px-1">
          <Ionicons name="flash" size={23} color="#6C4EF5" />
          <Text selectable className="mt-1 font-poppins-bold text-[22px] text-text-primary">{xpToday}</Text>
          <Text className="profile__muted text-center">XP today</Text>
        </View>
      </View>
    </View>
  );
}
