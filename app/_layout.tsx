import "../global.css";

import { posthog } from "@/lib/posthog";
import { useLanguageStore } from "@/store/languageStore";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { Stack, useGlobalSearchParams, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { PostHogProvider } from "posthog-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

SplashScreen.preventAutoHideAsync();

function useLanguageStoreHydrated() {
  const [isHydrated, setIsHydrated] = useState(
    useLanguageStore.persist.hasHydrated()
  );

  useEffect(() => {
    return useLanguageStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
  }, []);

  return isHydrated;
}

function ClerkIdentifier() {
  const { isSignedIn, user, isLoaded } = useUser();
  const selectedLanguage = useLanguageStore(
    (state) => state.selectedLanguage
  );
  const languageHydrated = useLanguageStoreHydrated();
  const userId = user?.id;

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || !languageHydrated) return;
    posthog.identify(userId, {
      $set_once: { signup_date: new Date().toISOString() },
      $set: { preferred_language: selectedLanguage ?? null },
    });
  }, [isLoaded, isSignedIn, userId, languageHydrated, selectedLanguage]);

  return null;
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const selectedLanguage = useLanguageStore(
    (state) => state.selectedLanguage
  );
  const languageHydrated = useLanguageStoreHydrated();

  if (!isLoaded || !languageHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#5543F5" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="language-select" />
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!isSignedIn && !!selectedLanguage}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostHogProvider
        client={posthog}
        autocapture={{
          captureScreens: true,
          captureTouches: true,
          propsToCapture: ["testID"],
          maxElementsCaptured: 20,
        }}
      >
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <ClerkIdentifier />
          <RootNavigator />
        </ClerkProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}
