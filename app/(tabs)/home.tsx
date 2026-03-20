import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { DashboardHeader } from "@/src/components/dashboard/dashboard-header";
import { MealBuilderSheet } from "@/src/components/dashboard/meal-builder-sheet";
import { MealsSection } from "@/src/components/dashboard/meals-section";
import { ProgressMetricCard } from "@/src/components/dashboard/progress-metric-card";
import { ProteinTargetChangeBanner } from "@/src/components/dashboard/protein-target-change-banner";
import { ProteinTargetExplanationSheet } from "@/src/components/dashboard/protein-target-explanation-sheet";
import { WaterTrackerCard } from "@/src/components/dashboard/water-tracker-card";
import { WeightEntryCard } from "@/src/components/dashboard/weight-entry-card";
import { WeightEntrySheet } from "@/src/components/dashboard/weight-entry-sheet";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { Screen } from "@/src/components/ui/screen";
import { SectionHeader } from "@/src/components/ui/section-header";
import { useToday } from "@/src/hooks/use-today";
import {
  formatWeightKg,
  getDayLabel,
  getGreeting,
  getRemainingLabel,
  getWeightDelta,
} from "@/src/lib/dashboard";
import { formatProjectedDays } from "@/src/lib/projection";
import { calcWaterTargetLiters } from "@/src/lib/psmf";
import { usePsmfStore } from "@/src/store/psmf-store";
import {
  selectCaloriesConsumed,
  selectCurrentProtocolContext,
  selectCurrentWeightKg,
  selectEstimatedCalorieTarget,
  selectGoalProgress,
  selectGoalProjection,
  selectIsOnboarded,
  selectMealsByDate,
  selectNextCategoryThreshold,
  selectPreviousEntry,
  selectProteinConsumed,
  selectProteinTargetChangeBanner,
  selectProtocolProgress,
  selectTodayEntry,
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
  const setDismissedProteinChangeKey = usePsmfStore(
    (store) => store.setDismissedProteinChangeKey,
  );
  const { today } = useToday();
  const onboarded = selectIsOnboarded(data);
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const [mealSheetOpen, setMealSheetOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<LoggedMeal | null>(null);
  const [proteinSheetOpen, setProteinSheetOpen] = useState(false);

  if (!onboarded) {
    return (
      <Screen>
        <SectionHeader
          description="Završi nekoliko kratkih koraka da izračunamo tvoj dnevni cilj proteina."
          eyebrow="Danas"
          title="Završi onboarding"
        />
        <EmptyState
          badge="Početak"
          description="Kad potvrdiš onboarding, ovde ćeš pratiti proteine, obroke i jutarnju težinu."
          title="Još nemaš aktivan plan"
        />
        <PrimaryButton
          label="Idi na onboarding"
          onPress={() => router.replace("/onboarding/welcome")}
        />
      </Screen>
    );
  }

  const currentProtocolContext = selectCurrentProtocolContext(data);
  const currentWeightKg = selectCurrentWeightKg(data) ?? data.startingWeightKg ?? 0;
  const proteinTarget = currentProtocolContext?.proteinTargetG ?? 0;
  const calorieTarget = selectEstimatedCalorieTarget(data) ?? 0;
  const proteinConsumed = selectProteinConsumed(data, today);
  const caloriesConsumed = selectCaloriesConsumed(data, today);
  const meals = selectMealsByDate(data, today);
  const protocol = selectProtocolProgress(data, today);
  const goalProjection = selectGoalProjection(data, today);
  const goalProgress = selectGoalProgress(data);
  const todayEntry = selectTodayEntry(data, today);
  const previousEntry = selectPreviousEntry(data, today);
  const proteinTargetChangeBanner = selectProteinTargetChangeBanner(data, today);
  const nextCategoryThreshold = selectNextCategoryThreshold(data);
  const todayWeightDelta = getWeightDelta(todayEntry, previousEntry);
  const waterTargetLiters = calcWaterTargetLiters(currentWeightKg);
  const proteinProgress = proteinTarget === 0 ? 0 : proteinConsumed / proteinTarget;
  const calorieProgress = calorieTarget === 0 ? 0 : caloriesConsumed / calorieTarget;
  const addMealLabel = meals.length ? "Dodaj još jedan obrok" : "Dodaj prvi obrok";
  const headerProgress = goalProgress?.progress ?? protocol.progress;
  const dayLabel =
    data.goalWeightKg !== null
      ? `CILJ ${formatWeightKg(data.goalWeightKg)}`
      : getDayLabel(protocol.elapsedDays, protocol.totalDays);
  const remainingLabel =
    goalProjection?.projectedDays !== null && goalProjection?.projectedDays !== undefined
      ? goalProjection.projectedDays === 0
        ? "Cilj dostignut"
        : `~${formatProjectedDays(goalProjection.projectedDays)} do cilja`
      : getRemainingLabel(protocol.remainingDays);

  async function handleSaveWeight(kg: number) {
    try {
      await saveWeightEntry(kg, today);
    } catch {
      showAlert(
        "Greška pri čuvanju",
        "Nismo uspeli da sačuvamo današnju težinu. Pokušaj ponovo.",
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
        "Greška pri čuvanju",
        "Nismo uspeli da sačuvamo obrok. Pokušaj ponovo.",
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
      "Obriši obrok",
      `Da li sigurno želiš da obrišeš "${meal.name}"?`,
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Obriši",
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
        dayLabel={dayLabel}
        onSettingsPress={() => router.push("../settings")}
        progress={headerProgress}
        remainingLabel={remainingLabel}
        title={`${getGreeting()}, ${data.userName || "sportista"}`}
      />

      {proteinTargetChangeBanner ? (
        <ProteinTargetChangeBanner
          onDismiss={() => {
            void setDismissedProteinChangeKey(proteinTargetChangeBanner.key);
          }}
          onExplain={() => setProteinSheetOpen(true)}
          payload={proteinTargetChangeBanner}
        />
      ) : null}

      <View className="gap-3">
        <View className="gap-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Današnji fokus
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Pogodi dnevni cilj proteina i zabeleži jutarnju težinu. Ostalo je
            pomoćno.
          </Text>
        </View>

        <ProgressMetricCard
          captionLabel="Automatski po jutarnjoj težini"
          percentLabel={`${Math.round(proteinProgress * 100)}%`}
          progress={proteinProgress}
          targetLabel={`od ${proteinTarget} g danas`}
          title="Proteini"
          tone="protein"
          valueLabel={`${proteinConsumed} g`}
        />

        <PrimaryButton
          label={addMealLabel}
          onPress={() => {
            setEditingMeal(null);
            setMealSheetOpen(true);
          }}
          variant="secondary"
        />

        <WeightEntryCard
          deltaKg={todayWeightDelta}
          onPress={() => setWeightSheetOpen(true)}
          todayWeightKg={todayEntry?.kg ?? null}
        />
      </View>

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

      {data.goalWeightKg === null ? (
        <Card className="gap-4 border-warning/30 bg-surface">
          <View className="gap-1">
            <Text className="text-sm font-semibold uppercase tracking-[1.8px] text-warning">
              Dodaj ciljnu težinu
            </Text>
            <Text className="text-2xl font-black text-text">
              Aktiviraj projekciju do cilja
            </Text>
          </View>
          <Text className="text-sm leading-6 text-muted">
            Kad uneseš ciljnu težinu, videćeš procenu koliko traje do cilja i grafikon
            koji se ažurira sa svakom novom jutarnjom težinom.
          </Text>
          <PrimaryButton
            label="Podesi ciljnu težinu"
            onPress={() => router.push("../settings")}
            variant="secondary"
          />
        </Card>
      ) : null}

      <View className="gap-3">
        <View className="gap-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
            Dodatno danas
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Kalorije i voda su pomoćni signali, dok su proteini i jutarnja
            težina prioritet.
          </Text>
        </View>

        <ProgressMetricCard
          percentLabel={`${Math.round(calorieProgress * 100)}%`}
          progress={calorieProgress}
          targetLabel={`od ${calorieTarget} kcal`}
          title="Kalorije"
          tone="calories"
          valueLabel={`${caloriesConsumed} kcal`}
        />
        <WaterTrackerCard targetLiters={waterTargetLiters} weightKg={currentWeightKg} />
      </View>

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

      <ProteinTargetExplanationSheet
        currentContext={currentProtocolContext}
        nextThreshold={nextCategoryThreshold}
        onOpenChange={setProteinSheetOpen}
        open={proteinSheetOpen}
      />
    </Screen>
  );
}
