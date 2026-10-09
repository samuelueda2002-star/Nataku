const apiOrigin = process.env.EXPO_PUBLIC_API_ORIGIN?.replace(/\/$/, "");

export default {
  expo: {
    name: "Nataku",
    slug: "nataku",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/nataku-icon.png",
    scheme: "duolingoclone",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jsmastery.duolingo-clone",
    },
    android: {
      package: "com.jsmastery.duolingoclone",
      adaptiveIcon: {
        backgroundColor: "#E6DFCF",
        foregroundImage: "./assets/images/nataku-icon.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "server",
      favicon: "./assets/images/nataku-icon.png",
    },
    plugins: [
      apiOrigin ? ["expo-router", { origin: apiOrigin }] : "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/nataku-mascot.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "@clerk/expo",
      "expo-secure-store",
      "@stream-io/video-react-native-sdk",
      [
        "@config-plugins/react-native-webrtc",
        {
          cameraPermission:
            "Allow $(PRODUCT_NAME) to access your camera for video lessons.",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone for audio lessons.",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 24,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
    },
  },
};
