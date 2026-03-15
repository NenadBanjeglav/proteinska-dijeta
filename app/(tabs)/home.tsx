import { useState } from "react";
import { router } from "expo-router";
import { Alert, View } from "react-native";

import { DashboardHeader } from "@/src/components/dashboard/dashboard-header";
import { MealBuilderSheet } from "@/src/components/dashboard/meal-builder-sheet";
import { MealsSection } from "@/src/components/dashboard/meals-section";
import { ProgressMetricCard } from "@/src/components/dashboard/progress-metric-card";
import { WaterTrackerCard } from "@/src/components/dashboard/water-tracker-card";
import { WeightEntryCard } from "@/src/components/dashboard/weight-entry-card";
import { WeightEntrySheet } from "@/src/components/dashboard/weight-entry-sheet";
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
import type { LoggedMeal } from "@/src/types/app";

function showAlert(title: string, message: string) {
  Alert.alert(title, message);
}

export default function HomeRoute() {
  const data = usePsmfStore((store) => store.data);
  const saveWeightEntry = usePsmfStore((store) => store.saveWeightEntry);
  const saveMeal = usePsmfStore((store) => store.saveMeal);
  const deleteMeal = usePsmfStore((store) => store.deleteMeal);
  const setWaterGlasses = usePsmfStore((store) => store.setWaterGlasses);
  const { today } = useToday();
  const onboarded = selectIsOnboarded(data);
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const [mealSheetOpen, setMealSheetOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<LoggedMeal | null>(null);

  if (!onboarded) {
    return (
      <Screen>
        <SectionHeader
          description="Zavrsi nekoliko kratkih koraka da izracunamo tvoj dnevni cilj proteina."
          eyebrow="Danas"
          title="Zavrsi onboarding"
        />
        <EmptyState
          badge="Pocetak"
          description="Kad potvrdis onboarding, ovde ces pratiti proteine, obroke, vodu i jutarnju tezinu."
          title="Jos nemas aktivan plan"
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

  async function handleSaveMeal(meal: LoggedMeal) {
    try {
      await saveMeal(meal);
      setEditingMeal(null);
    } catch {
      showAlert(
        "Greska pri cuvanju",
        "Nismo uspeli da sacuvamo obrok. Pokusaj ponovo.",
      );
      throw new Error("save-meal-failed");
    }
  }

  function handleMealSheetChange(nextOpen: boolean) {
    setMealSheetOpen(nextOpen);
    if (!nextOpen) {
      setEditingMeal(null);
    }
  }

  function handleDeleteMeal(meal: LoggedMeal) {
    Alert.alert(
      "Obrisi obrok",
      `Da li sigurno zelis da obrises "${meal.name}"?`,
      [
        { text: "Otkazi", style: "cancel" },
        {
          text: "Obrisi",
          style: "destructive",
          onPress: () => {
            void deleteMeal(meal.id);
          },
        },
      ],
    );
  }

  return (
    <Screen contentClassName="gap-5">
      <DashboardHeader
        dayLabel={getDayLabel(protocol.elapsedDays, protocol.totalDays)}
        onSettingsPress={() => router.push("../settings")}
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

      <MealsSection
        meals={meals}
        onAdd={() => {
          setEditingMeal(null);
          setMealSheetOpen(true);
        }}
        onDelete={handleDeleteMeal}
        onEdit={(meal) => {
          setEditingMeal(meal);
          setMealSheetOpen(true);
        }}
        proteinConsumed={proteinConsumed}
      />

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

      <MealBuilderSheet
        date={today}
        meal={editingMeal}
        mealsForDate={meals}
        onOpenChange={handleMealSheetChange}
        onSave={handleSaveMeal}
        open={mealSheetOpen}
      />
    </Screen>
  );
}
