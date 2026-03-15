import { useState } from "react";
import { router } from "expo-router";
import { Alert, Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { Chip } from "@/src/components/ui/chip";
import { EmptyState } from "@/src/components/ui/empty-state";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { ProgressBar } from "@/src/components/ui/progress-bar";
import { Screen } from "@/src/components/ui/screen";
import { SectionHeader } from "@/src/components/ui/section-header";
import { StatTile } from "@/src/components/ui/stat-tile";
import { useToday } from "@/src/hooks/use-today";
import { usePsmfStore } from "@/src/store/psmf-store";
import {
  selectCaloriesConsumed,
  selectCurrentWeightKg,
  selectEstimatedCalorieTarget,
  selectIsOnboarded,
  selectProteinConsumed,
  selectProtocolProgress,
  selectWaterGlasses,
} from "@/src/store/selectors";

export default function HomeRoute() {
  const data = usePsmfStore((store) => store.data);
  const clearStore = usePsmfStore((store) => store.clearStore);
  const { today } = useToday();
  const onboarded = selectIsOnboarded(data);
  const [isResetting, setIsResetting] = useState(false);

  function handleResetPress() {
    if (isResetting) {
      return;
    }

    Alert.alert(
      "Reset aplikacije",
      "Ovo brise samo lokalne podatke ove aplikacije i vraca te na onboarding. Expo Go ostaje netaknut.",
      [
        { text: "Otkazi", style: "cancel" },
        {
          text: "Resetuj",
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

  if (!onboarded) {
    return (
      <Screen>
        <SectionHeader
          description="Pocetni routing vec radi, ali onboarding jos nije zavrsen."
          eyebrow="Danas"
          title="Zavrsi onboarding"
        />
        <EmptyState
          badge="Prvi launch"
          description="Faza 1 postavlja store, navigaciju i placeholder rute. Sledeca faza uvodi pravi onboarding state i finalno cuvanje podataka."
          title="Jos nema aktivnog plana"
        />
        <PrimaryButton
          label="Idi na onboarding"
          onPress={() => router.replace("/onboarding/welcome")}
        />
      </Screen>
    );
  }

  const proteinConsumed = selectProteinConsumed(data, today);
  const proteinTarget = data.proteinTargetG ?? 0;
  const estimatedCalories = selectEstimatedCalorieTarget(data) ?? 0;
  const caloriesConsumed = selectCaloriesConsumed(data, today);
  const protocol = selectProtocolProgress(data, today);
  const currentWeight = selectCurrentWeightKg(data);
  const waterGlasses = selectWaterGlasses(data, today);

  return (
    <Screen>
      <View className="gap-4">
        <Chip label="Phase 1 shell" variant="warning" />
        <SectionHeader
          description="Dashboard sada cita stvarni Zustand store i hydration stanje. Faze 4-7 ce zameniti placeholder kartice finalnim iskustvom."
          eyebrow={`Danas - ${today}`}
          title={`Zdravo, ${data.userName ?? "korisnice"}`}
        />
      </View>

      <Card className="gap-4">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-sm text-muted">Napredak protokola</Text>
            <Text className="text-2xl font-black text-text">
              {protocol.elapsedDays}
              <Text className="text-base font-semibold text-muted">
                {protocol.totalDays ? ` / ${protocol.totalDays} dana` : ""}
              </Text>
            </Text>
          </View>
          <Chip
            label={data.goalType ? `Cilj: ${data.goalType}` : "Cilj uskoro"}
            variant="accent"
          />
        </View>
        <ProgressBar progress={protocol.progress} />
      </Card>

      <View className="gap-4">
        <StatTile
          accent
          label="Protein cilj"
          subtitle={`${proteinConsumed} g uneto danas`}
          value={`${proteinTarget} g`}
        />
        <StatTile
          label="Procenjene kalorije"
          subtitle={`${caloriesConsumed} kcal uneto danas`}
          value={`${estimatedCalories}`}
        />
        <StatTile
          label="Trenutna tezina"
          subtitle="Bice povezana sa weight entry tokom faze 5"
          value={currentWeight !== null ? `${currentWeight} kg` : "-"}
        />
        <StatTile
          label="Voda"
          subtitle="Daily tracker stize u fazi 7"
          value={`${waterGlasses} casa`}
        />
      </View>

      {__DEV__ ? (
        <Card className="gap-3 border-warning/30 bg-warning/10">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Debug
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Reset brise samo projektni store i vraca te na onboarding radi testiranja.
          </Text>
          <PrimaryButton
            disabled={isResetting}
            label={isResetting ? "Resetujem..." : "Reset onboarding"}
            onPress={handleResetPress}
            variant="secondary"
          />
        </Card>
      ) : null}
    </Screen>
  );
}
