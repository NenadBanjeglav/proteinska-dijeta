import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { DashboardHeader } from "@/src/components/dashboard/dashboard-header";
import { MealBuilderSheet } from "@/src/components/dashboard/meal-builder-sheet";
import { MealsSection } from "@/src/components/dashboard/meals-section";
import { ProgressMetricCard } from "@/src/components/dashboard/progress-metric-card";
import { ProteinTargetChangeBanner } from "@/src/components/dashboard/protein-target-change-banner";
import { ProteinTargetExplanationSheet } from "@/src/components/dashboard/protein-target-explanation-sheet";
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
import { getMealTemplateSignature } from "@/src/lib/meal-templates";
import { formatProjectedDays } from "@/src/lib/projection";
import { calcWaterTargetLiters } from "@/src/lib/psmf";
import { formatKcal, formatMacroGrams, formatRoundedNumber } from "@/src/lib/units";
import { usePsmfStore } from "@/src/store/psmf-store";
import {
  selectCaloriesConsumed,
  selectCarbsConsumed,
  selectCurrentProtocolContext,
  selectCurrentWeightKg,
  selectEstimatedCalorieTarget,
  selectFatConsumed,
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
  const saveMealTemplate = usePsmfStore((store) => store.saveMealTemplate);
  const deleteMealTemplate = usePsmfStore((store) => store.deleteMealTemplate);
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
          description="Zavrsi nekoliko kratkih koraka da izracunamo tvoj dnevni cilj proteina."
          eyebrow="Danas"
          title="Zavrsi onboarding"
        />
        <EmptyState
          badge="Pocetak"
          description="Kad potvrdis onboarding, ovde ces pratiti proteine, obroke i jutarnju tezinu."
          title="Jos nemas aktivan plan"
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
  const carbsConsumed = selectCarbsConsumed(data, today);
  const fatConsumed = selectFatConsumed(data, today);
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
  const waterTargetLabel = formatRoundedNumber(waterTargetLiters, 1).replace(".", ",");
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
    Alert.alert("Obrisi obrok", `Da li sigurno zelis da obrises "${meal.name}"?`, [
      { text: "Otkazi", style: "cancel" },
      {
        text: "Obrisi",
        style: "destructive",
        onPress: () => {
          void deleteMeal(meal.id);
        },
      },
    ]);
  }

  function findTemplateIdForMeal(meal: LoggedMeal) {
    const mealSignature = getMealTemplateSignature(meal);

    return (
      data.mealTemplates.find(
        (template) => getMealTemplateSignature(template) === mealSignature,
      )?.id ?? null
    );
  }

  function handleToggleMealTemplate(meal: LoggedMeal) {
    const templateId = findTemplateIdForMeal(meal);

    if (templateId) {
      void deleteMealTemplate(templateId);
      return;
    }

    void saveMealTemplate(meal);
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
            Danasnji fokus
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Protein i jutarnja tezina su glavni signali za danas.
          </Text>
        </View>

        <ProgressMetricCard
          captionLabel="Automatski po jutarnjoj tezini"
          percentLabel={`${Math.round(proteinProgress * 100)}%`}
          progress={proteinProgress}
          targetLabel={`od ${formatMacroGrams(proteinTarget)} g danas`}
          title="Proteini"
          tone="protein"
          valueLabel={`${formatMacroGrams(proteinConsumed)} g`}
        />

        <WeightEntryCard
          deltaKg={todayWeightDelta}
          onPress={() => setWeightSheetOpen(true)}
          todayWeightKg={todayEntry?.kg ?? null}
        />
      </View>

      <MealsSection
        mealTemplates={data.mealTemplates}
        meals={meals}
        onDelete={handleDeleteMeal}
        onEdit={(meal) => {
          setEditingMeal(meal);
          setMealSheetOpen(true);
        }}
        onToggleTemplate={handleToggleMealTemplate}
        proteinConsumed={proteinConsumed}
      />

      {data.goalWeightKg === null ? (
        <Card className="gap-4 border-warning/30 bg-surface">
          <View className="gap-1">
            <Text className="text-sm font-semibold uppercase tracking-[1.8px] text-warning">
              Dodaj ciljnu tezinu
            </Text>
            <Text className="text-2xl font-black text-text">
              Aktiviraj projekciju do cilja
            </Text>
          </View>
          <Text className="text-sm leading-6 text-muted">
            Kad uneses ciljnu tezinu, videces procenu koliko traje do cilja i grafikon
            koji se azurira sa svakom novom jutarnjom tezinom.
          </Text>
          <PrimaryButton
            label="Podesi ciljnu tezinu"
            onPress={() => router.push("../settings")}
            variant="secondary"
          />
        </Card>
      ) : null}

      <Card className="gap-4 px-4 py-4">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
              Dodatno
            </Text>
            <Text className="text-sm text-muted">
              Kalorije, makroi i voda kao kratka provera.
            </Text>
          </View>
          <View className="items-end gap-1">
            <Text
              className="text-xl font-black text-text"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {formatKcal(caloriesConsumed)} kcal
            </Text>
            <Text className="text-xs text-muted">od {formatKcal(calorieTarget)} kcal</Text>
          </View>
        </View>

        <View className="h-px bg-border" />

        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[92px] flex-1 gap-1 rounded-2xl bg-surface-soft px-3 py-3">
            <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-muted">
              Protein
            </Text>
            <Text className="text-lg font-black text-text">
              {formatMacroGrams(proteinConsumed)} g
            </Text>
          </View>
          <View className="min-w-[92px] flex-1 gap-1 rounded-2xl bg-surface-soft px-3 py-3">
            <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-muted">
              UH
            </Text>
            <Text className="text-lg font-black text-text">
              {formatMacroGrams(carbsConsumed)} g
            </Text>
          </View>
          <View className="min-w-[92px] flex-1 gap-1 rounded-2xl bg-surface-soft px-3 py-3">
            <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-muted">
              Masti
            </Text>
            <Text className="text-lg font-black text-text">
              {formatMacroGrams(fatConsumed)} g
            </Text>
          </View>
          <View className="min-w-[92px] flex-1 gap-1 rounded-2xl bg-surface-soft px-3 py-3">
            <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-muted">
              Voda
            </Text>
            <Text className="text-lg font-black text-text">{waterTargetLabel} L</Text>
          </View>
        </View>
      </Card>

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
