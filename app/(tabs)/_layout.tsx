import { Tabs } from "expo-router";

import { TAB_LABELS } from "@/src/constants/copy";
import { colors } from "@/src/constants/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.muted,
        tabBarIconStyle: {
          display: "none",
        },
        tabBarItemStyle: {
          justifyContent: "center",
          paddingVertical: 6,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: TAB_LABELS.home,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: TAB_LABELS.progress,
        }}
      />
    </Tabs>
  );
}
