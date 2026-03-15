import { router } from "expo-router";
import { Text, View } from "react-native";

import { EmptyState } from "@/src/components/ui/empty-state";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { Screen } from "@/src/components/ui/screen";

export default function NotFoundScreen() {
  return (
    <Screen contentClassName="justify-center gap-6" scroll={false}>
      <View className="gap-6">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-warning">
          404
        </Text>
        <EmptyState
          badge="Ruta ne postoji"
          description="Vrati se na početak aplikacije i nastavi kroz onboarding ili tabove."
          title="Ova stranica nije pronađena"
        />
      </View>
      <PrimaryButton label="Nazad na početak" onPress={() => router.replace("/")} />
    </Screen>
  );
}
