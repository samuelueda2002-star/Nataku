import { useAuth } from "@clerk/expo";
import { images } from "@/constants/images";
import { Link, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLanguageStore } from "@/store/languageStore";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { selectedLanguage } = useLanguageStore();
  const [languageHydrated, setLanguageHydrated] = useState(
    useLanguageStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (languageHydrated) return;
    return useLanguageStore.persist.onFinishHydration(() =>
      setLanguageHydrated(true)
    );
  }, [languageHydrated]);

  if (!isLoaded || !languageHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6c4ef5" />
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View className="flex-1 items-center justify-center px-7">
          <Image
            source={images.mascotLogo}
            className="h-40 w-40"
            resizeMode="contain"
          />
          <Text className="font-poppins-semibold text-[28px] text-text-primary">
            muolingo
          </Text>
          <Link href="/onboarding" asChild>
            <TouchableOpacity className="mt-10 w-full items-center rounded-[18px] bg-[#5543F5] py-5">
              <Text className="font-poppins-semibold text-base text-white">
                Open onboarding
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/language-select" asChild>
            <TouchableOpacity className="mt-3 w-full items-center rounded-[18px] border border-[#5543F5] py-4">
              <Text className="font-poppins-semibold text-base text-[#5543F5]">
                Choose a language
              </Text>
            </TouchableOpacity>
          </Link>
          <View className="mt-4 w-full flex-row gap-3">
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity className="flex-1 items-center rounded-[18px] bg-[#F0EDFF] py-4">
                <Text className="font-poppins-semibold text-base text-[#5543F5]">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity className="flex-1 items-center rounded-[18px] border border-[#5543F5] py-4">
                <Text className="font-poppins-semibold text-base text-[#5543F5]">
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedLanguage) {
    return <Redirect href="/language-select" />;
  }

  return <Redirect href="/(tabs)" />;
}
