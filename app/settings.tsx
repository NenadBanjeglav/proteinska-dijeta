import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router, Stack } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { HeaderActionButton } from "@/src/components/ui/header-action-button";
import { Screen } from "@/src/components/ui/screen";
import { usePsmfStore } from "@/src/store/psmf-store";

export default function SettingsRoute() {
  const data = usePsmfStore((store) => store.data);
  const clearStore = usePsmfStore((store) => store.clearStore);
  const [isResetting, setIsResetting] = useState(false);
  const appName = Constants.expoConfig?.name ?? "Proteinska Dijeta";
  const appVersion = Constants.expoConfig?.version ?? "0.1.0";
  const waterDays = Object.keys(data.waterGlassesByDate).length;

  function handleResetPress() {
    if (isResetting) {
      return;
    }

    Alert.alert(
      "Obrisi lokalne podatke",
      "Ovo ce obrisati onboarding, tezine, obroke i vodu sa ovog uredjaja. Posle toga aplikacija krece ispocetka.",
      [
        { text: "Otkazi", style: "cancel" },
        {
          text: "Obrisi sve",
          style: "destructive",
          onPress: () => {
            setIsResetting(true);
            void clearStore()
              .then(() => {
                router.replace("/onboarding/welcome");
              })
              .finally(() => {
                setIsResetting(false);
              });
          },
        },
      ],
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: "slide_from_right" }} />

      <Screen contentClassName="gap-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-[40px] font-black leading-[44px] text-text">
              Podesavanja
            </Text>
            <Text className="text-base leading-6 text-muted">
              Ovde upravljas lokalnim podacima i vidis osnovne informacije o aplikaciji.
            </Text>
          </View>

          <HeaderActionButton
            accessibilityLabel="Nazad"
            icon="arrow-back"
            onPress={() => router.back()}
          />
        </View>

        <Card className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            O aplikaciji
          </Text>
          <View className="gap-1">
            <Text className="text-2xl font-black text-text">{appName}</Text>
            <Text className="text-sm text-muted">Verzija {appVersion}</Text>
          </View>
          <Text className="text-sm leading-6 text-muted">
            Aplikacija za lokalno pracenje proteina, tezine, vode i napretka u PSMF fazi.
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Podaci ostaju samo na ovom uredjaju. Aplikacija nema nalog, cloud ni deljenje podataka.
          </Text>
        </Card>

        <Card className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Tvoji lokalni podaci
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[96px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Tezine</Text>
              <Text className="text-3xl font-black text-text">{data.weightHistory.length}</Text>
            </View>
            <View className="min-w-[96px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Obroci</Text>
              <Text className="text-3xl font-black text-text">{data.meals.length}</Text>
            </View>
            <View className="min-w-[96px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Dani vode</Text>
              <Text className="text-3xl font-black text-text">{waterDays}</Text>
            </View>
          </View>
          <Text className="text-sm leading-6 text-muted">
            Reset brise sve ove podatke i vraca te na onboarding.
          </Text>
        </Card>

        <Card className="gap-4 border-danger/30 bg-danger/10">
          <View className="gap-1">
            <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-danger">
              Reset aplikacije
            </Text>
            <Text className="text-2xl font-black text-text">Obrisi sve lokalne podatke</Text>
          </View>
          <Text className="text-sm leading-6 text-muted">
            Koristi ovo samo ako zaista zelis da krenes ispocetka. Ova radnja je trajna.
          </Text>

          <Pressable
            className="min-h-[60px] items-center justify-center rounded-3xl border border-danger/30 bg-danger/15 px-6"
            disabled={isResetting}
            onPress={handleResetPress}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons color="#F04438" name="trash-outline" size={18} />
              <Text className="text-base font-semibold text-danger">
                {isResetting ? "Brisem podatke..." : "Obrisi sve i kreni ispocetka"}
              </Text>
            </View>
          </Pressable>
        </Card>
      </Screen>
    </>
  );
}
