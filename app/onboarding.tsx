import { images } from "@/constants/images";
import { posthog } from "@/lib/posthog";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const { height, width } = useWindowDimensions();
  const mascotSize = Math.min(420, height * 0.42, width * 1.08);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View className="flex-1 px-7">
        <View className="mt-[14px] h-[72px] flex-row items-center justify-center">
          <Image
            source={images.mascotLogo}
            className="h-[72px] w-[72px] rounded-[18px]"
            resizeMode="contain"
          />
          <View className="ml-2">
            <Text className="font-poppins-semibold text-[26px] text-[#23D56C]">
              Nataku
            </Text>
            <Text className="font-poppins text-[11px] text-text-secondary">
              English School
            </Text>
          </View>
        </View>

        <View className="mt-[40px] px-3">
          <Text className="font-poppins-bold text-[32px] leading-[48px] text-text-primary">
            {"Your AI language\n"}
            <Text className="text-[#5543F5]">teacher.</Text>
          </Text>
          <Text className="mt-4 font-poppins text-[16px] leading-[29px] text-[#56627C]">
            {"Real conversations, personalized\nlessons, anytime, anywhere."}
          </Text>
        </View>

        <View className="relative mt-[18px] flex-1">
          <Image
            source={images.mascotWelcome}
            className="absolute left-1/2 top-1"
            style={{
              width: mascotSize,
              height: mascotSize,
              marginLeft: -mascotSize / 2 - 10,
            }}
            resizeMode="contain"
          />

          <View
            className="absolute left-[14px] top-[20px] h-[54px] w-[100px] items-center justify-center rounded-[17px] bg-[#EAF4FF]"
            style={{ transform: [{ rotate: "-8deg" }] }}
          >
            <View
              className="absolute -bottom-[6px] right-[15px] h-4 w-4 bg-[#EAF4FF]"
              style={{ transform: [{ rotate: "45deg" }] }}
            />
            <Text className="font-poppins-medium text-[20px] text-text-primary">
              Hello!
            </Text>
          </View>

          <View
            className="absolute right-[14px] -top-[7px] h-[54px] w-[100px] items-center justify-center rounded-[17px] bg-[#F6F4FF]"
            style={{ transform: [{ rotate: "10deg" }] }}
          >
            <View
              className="absolute -bottom-[6px] left-[17px] h-4 w-4 bg-[#F6F4FF]"
              style={{ transform: [{ rotate: "45deg" }] }}
            />
            <Text className="font-poppins-medium text-[20px] text-[#4333CC]">
              ¡Hola!
            </Text>
          </View>

          <View
            className="absolute right-0 top-[180px] h-[54px] w-[88px] items-center justify-center rounded-[17px] bg-[#FFF0E9]"
            style={{ transform: [{ rotate: "9deg" }] }}
          >
            <View
              className="absolute -bottom-[6px] left-[16px] h-4 w-4 bg-[#FFF0E9]"
              style={{ transform: [{ rotate: "45deg" }] }}
            />
            <Text className="font-poppins-medium text-[20px] text-[#F04438]">
              你好!
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="mb-[26px] h-[74px] flex-row items-center justify-center rounded-[18px] bg-[#5543F5]"
          activeOpacity={0.85}
          testID="get-started-button"
          onPress={() => {
            posthog.capture("onboarding_get_started_tapped");
            router.push("/(auth)/sign-up");
          }}
        >
          <Text className="font-poppins-semibold text-[20px] text-white">
            Get Started
          </Text>
          <View className="absolute right-7">
            <Ionicons name="chevron-forward" size={26} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
