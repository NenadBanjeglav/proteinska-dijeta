import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router, Stack } from "expo-router";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { HeaderActionButton } from "@/src/components/ui/header-action-button";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { Screen } from "@/src/components/ui/screen";
import {
  formatNumberInput,
  isGoalWeightValid,
  parseNumberInput,
} from "@/src/lib/onboarding";
import { roundTo } from "@/src/lib/units";
import { usePsmfStore } from "@/src/store/psmf-store";
import { selectCurrentWeightKg } from "@/src/store/selectors";

export default function SettingsRoute() {
  const data = usePsmfStore((store) => store.data);
  const clearStore = usePsmfStore((store) => store.clearStore);
  const setGoalWeightKg = usePsmfStore((store) => store.setGoalWeightKg);
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [draftGoalWeight, setDraftGoalWeight] = useState(
    formatNumberInput(data.goalWeightKg, 1),
  );
  const appName = Constants.expoConfig?.name ?? "Proteinska Dijeta";
  const appVersion = Constants.expoConfig?.version ?? "0.1.0";
  const waterDays = Object.keys(data.waterGlassesByDate).length;
  const currentWeightKg = selectCurrentWeightKg(data);
  const parsedGoalWeight = parseNumberInput(draftGoalWeight);
  const canSaveGoal = isGoalWeightValid(currentWeightKg, parsedGoalWeight);
  const goalChanged =
    parsedGoalWeight !== null && roundTo(parsedGoalWeight, 1) !== data.goalWeightKg;
  const goalSummary = useMemo(() => {
    if (data.goalWeightKg === null) {
      return "Jos nije uneta";
    }

    return `${formatNumberInput(data.goalWeightKg, 1)} kg`;
  }, [data.goalWeightKg]);

  useEffect(() => {
    setDraftGoalWeight(formatNumberInput(data.goalWeightKg, 1));
  }, [data.goalWeightKg]);

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

  function handleSaveGoalWeight() {
    if (!canSaveGoal || parsedGoalWeight === null || isSavingGoal) {
      return;
    }

    setIsSavingGoal(true);
    void setGoalWeightKg(roundTo(parsedGoalWeight, 1)).finally(() => {
      setIsSavingGoal(false);
    });
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

        <Card className="gap-3 border-warning/30 bg-surface">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Ciljna tezina
          </Text>
          <View className="gap-1">
            <Text className="text-2xl font-black text-text">{goalSummary}</Text>
            <Text className="text-sm leading-6 text-muted">
              {currentWeightKg === null
                ? "Ciljnu tezinu mozemo da sacuvamo cim postoji trenutna tezina u planu."
                : `Trenutna tezina za poredjenje: ${formatNumberInput(currentWeightKg, 1)} kg`}
            </Text>
          </View>

          <TextInput
            className="rounded-3xl bg-surface-soft px-5 py-4 text-2xl font-bold text-text"
            keyboardType="decimal-pad"
            onChangeText={setDraftGoalWeight}
            placeholder="Unesi ciljnu tezinu"
            placeholderTextColor="#64748B"
            value={draftGoalWeight}
          />

          {currentWeightKg !== null &&
          parsedGoalWeight !== null &&
          parsedGoalWeight >= currentWeightKg ? (
            <Text className="text-sm leading-6 text-danger">
              Ciljna tezina mora da bude niza od trenutne da bi projekcija imala smisla.
            </Text>
          ) : (
            <Text className="text-sm leading-6 text-muted">
              Menjanjem ciljne tezine odmah menjas i live projekciju na pocetnoj i progress ekranu.
            </Text>
          )}

          <PrimaryButton
            disabled={!canSaveGoal || !goalChanged || isSavingGoal}
            label={data.goalWeightKg === null ? "Sacuvaj ciljnu tezinu" : "Azuriraj ciljnu tezinu"}
            loading={isSavingGoal}
            onPress={handleSaveGoalWeight}
            variant="secondary"
          />
        </Card>

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
