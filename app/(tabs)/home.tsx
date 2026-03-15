import { useState } from "react";
import { router } from "expo-router";
import { Alert, Text, View } from "react-native";

import { DashboardHeader } from "@/src/components/dashboard/dashboard-header";
import { MealsSection } from "@/src/components/dashboard/meals-section";
import { ProgressMetricCard } from "@/src/components/dashboard/progress-metric-card";
import { WaterTrackerCard } from "@/src/components/dashboard/water-tracker-card";
import { WeightEntryCard } from "@/src/components/dashboard/weight-entry-card";
import { WeightEntrySheet } from "@/src/components/dashboard/weight-entry-sheet";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { Screen } from "@/src/components/ui/screen";
import { SectionHeader } from "@/src/components/ui/section-header";
import {
  getDayLabel,
  getGreeting,
  getRemainingLabel,
  getWeightDelta,
} from "@/src/lib/dashboard";
import { calcWaterTargetGlasses } from "@/src/lib/psmf";
import { useToday } from "@/src/hooks/use-today";
import { usePsmfStore } from "@/src/store/psmf-store";
import {
  selectCaloriesConsumed,
  selectEstimatedCalorieTarget,
  selectIsOnboarded,
  selectMealsByDate,
  selectPreviousEntry,
  selectProteinConsumed,
  selectProtocolProgress,
  selectTodayEntry,
  selectWaterGlasses,
} from "@/src/store/selectors";

function showAlert(title: string, message: string) {
  Alert.alert(title, message);
}

export default function HomeRoute() {
  const data = usePsmfStore((store) => store.data);
  const clearStore = usePsmfStore((store) => store.clearStore);
  const saveWeightEntry = usePsmfStore((store) => store.saveWeightEntry);
  const setWaterGlasses = usePsmfStore((store) => store.setWaterGlasses);
  const { today } = useToday();
  const onboarded = selectIsOnboarded(data);
  const [isResetting, setIsResetting] = useState(false);
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);

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

  const proteinTarget = data.proteinTargetG ?? 0;
  const calorieTarget = selectEstimatedCalorieTarget(data) ?? 0;
  const proteinConsumed = selectProteinConsumed(data, today);
  const caloriesConsumed = selectCaloriesConsumed(data, today);
  const meals = selectMealsByDate(data, today);
  const protocol = selectProtocolProgress(data, today);
  const todayEntry = selectTodayEntry(data, today);
  const previousEntry = selectPreviousEntry(data, today);
  const todayWeightDelta = getWeightDelta(todayEntry, previousEntry);
  const waterGlasses = selectWaterGlasses(data, today);
  const waterTarget =
    data.startingWeightKg === null ? 8 : calcWaterTargetGlasses(data.startingWeightKg);
  const proteinProgress = proteinTarget === 0 ? 0 : proteinConsumed / proteinTarget;
  const calorieProgress = calorieTarget === 0 ? 0 : caloriesConsumed / calorieTarget;

  async function handleSaveWeight(kg: number) {
    try {
      await saveWeightEntry(kg, today);
    } catch {
      showAlert(
        "Greska pri cuvanju",
        "Nismo uspeli da sacuvamo danasnju tezinu. Pokusaj ponovo.",
      );
      throw new Error("save-weight-failed");
    }
  }

  return (
    <Screen contentClassName="gap-5">
      <DashboardHeader
        dayLabel={getDayLabel(protocol.elapsedDays, protocol.totalDays)}
        onPlanPress={() =>
          showAlert(
            "Plan protokola",
            `Danas je ${protocol.elapsedDays}. dan plana. ${getRemainingLabel(protocol.remainingDays)}.`,
          )
        }
        progress={protocol.progress}
        remainingLabel={getRemainingLabel(protocol.remainingDays)}
        title={`${getGreeting()}, ${data.userName || "sportista"}`}
      />

      <View className="flex-row gap-3">
        <ProgressMetricCard
          percentLabel={`${Math.round(proteinProgress * 100)}%`}
          progress={proteinProgress}
          targetLabel={`od ${proteinTarget}g`}
          title="Proteini"
          tone="protein"
          valueLabel={`${proteinConsumed}g`}
        />
        <ProgressMetricCard
          percentLabel={`${Math.round(calorieProgress * 100)}%`}
          progress={calorieProgress}
          targetLabel={`od ${calorieTarget}`}
          title="Kalorije"
          tone="calories"
          valueLabel={`${caloriesConsumed}`}
        />
      </View>

      <WaterTrackerCard
        currentGlasses={waterGlasses}
        onDecrease={() => {
          void setWaterGlasses(today, Math.max(0, waterGlasses - 1));
        }}
        onIncrease={() => {
          void setWaterGlasses(today, waterGlasses + 1);
        }}
        targetGlasses={waterTarget}
      />

      <MealsSection meals={meals} proteinConsumed={proteinConsumed} />

      <WeightEntryCard
        deltaKg={todayWeightDelta}
        onPress={() => setWeightSheetOpen(true)}
        todayWeightKg={todayEntry?.kg ?? null}
      />

      <WeightEntrySheet
        onOpenChange={setWeightSheetOpen}
        onSave={handleSaveWeight}
        open={weightSheetOpen}
        previousEntry={previousEntry}
        today={today}
        todayWeightKg={todayEntry?.kg ?? null}
      />

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
