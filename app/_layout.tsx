import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";

import { APP_NAME } from "@/src/constants/copy";
import { Card } from "@/src/components/ui/card";
import { Screen } from "@/src/components/ui/screen";
import { useHydratedStore } from "@/src/hooks/use-hydrated-store";

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  const { ready } = useHydratedStore();

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return (
      <>
        <StatusBar style="light" />
        <Screen contentClassName="items-center justify-center gap-6" scroll={false}>
          <Card className="w-full max-w-[420px] gap-3">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-warning">
              Ucitavanje
            </Text>
            <Text className="text-3xl font-black text-text">{APP_NAME}</Text>
            <Text className="text-base leading-6 text-muted">
              Ucitavamo tvoj lokalni plan i pripremamo aplikaciju za danasnji unos.
            </Text>
          </Card>
        </Screen>
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#0B0C11" },
          headerShown: false,
        }}
      />
    </>
  );
}
