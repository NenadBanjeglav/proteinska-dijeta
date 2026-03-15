import { Tabs } from "expo-router";

import { TAB_LABELS } from "@/src/constants/copy";
import { colors } from "@/src/constants/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
          fontSize: 20,
          fontWeight: "700",
        },
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 72,
          paddingTop: 10,
          paddingBottom: 10,
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
