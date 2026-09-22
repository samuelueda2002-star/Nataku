import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { type ComponentProps, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";

const ACTIVE_CIRCLE_SIZE = 48;
const TAB_CONTENT_HEIGHT = 68;

type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

type TabConfig = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  index: { label: "Home", icon: "home-outline", activeIcon: "home" },
  learn: { label: "Learn", icon: "book-outline", activeIcon: "book" },
  "ai-teacher": {
    label: "AI Teacher",
    icon: "sparkles-outline",
    activeIcon: "sparkles",
  },
  chat: {
    label: "Chat",
    icon: "chatbubble-outline",
    activeIcon: "chatbubble",
  },
  profile: {
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
};

export function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const visibleRoutes = state.routes.filter((route) => TAB_CONFIG[route.name]);
  const activeRouteName = state.routes[state.index]?.name;
  const visibleIndex = Math.max(
    0,
    visibleRoutes.findIndex((route) =>
      activeRouteName === "lesson/[id]"
        ? route.name === "learn"
        : route.name === activeRouteName,
    ),
  );
  const tabWidth = width / visibleRoutes.length;
  const indicatorX = useSharedValue(
    visibleIndex * tabWidth + (tabWidth - ACTIVE_CIRCLE_SIZE) / 2,
  );

  useEffect(() => {
    indicatorX.value = withSpring(
      visibleIndex * tabWidth + (tabWidth - ACTIVE_CIRCLE_SIZE) / 2,
      {
        damping: 20,
        mass: 0.8,
        stiffness: 180,
      },
    );
  }, [indicatorX, tabWidth, visibleIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      className="flex-row bg-white"
      style={[
        styles.container,
        { height: TAB_CONTENT_HEIGHT + insets.bottom },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.activeCircle, indicatorStyle]}
      />

      {visibleRoutes.map((route) => {
        const tab = TAB_CONFIG[route.name];
        const isRouteFocused = route.name === activeRouteName;
        const isFocused =
          route.name === activeRouteName ||
          (activeRouteName === "lesson/[id]" && route.name === "learn");
        const options = descriptors[route.key].options;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isRouteFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? tab.label}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            activeOpacity={0.75}
            onLongPress={onLongPress}
            onPress={onPress}
            style={styles.tabButton}
            testID={options.tabBarButtonTestID}
          >
            <Ionicons
              color={isFocused ? "#FFFFFF" : colors.neutral.textSecondary}
              name={isFocused ? tab.activeIcon : tab.icon}
              size={24}
            />

            {!isFocused ? (
              <Text className="mt-1 font-poppins-medium text-[10px] text-text-secondary">
                {tab.label}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#17213D",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 12,
  },
  activeCircle: {
    position: "absolute",
    top: 10,
    left: 0,
    width: ACTIVE_CIRCLE_SIZE,
    height: ACTIVE_CIRCLE_SIZE,
    borderRadius: ACTIVE_CIRCLE_SIZE / 2,
    backgroundColor: colors.primary.purple,
  },
  tabButton: {
    flex: 1,
    height: TAB_CONTENT_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
});
