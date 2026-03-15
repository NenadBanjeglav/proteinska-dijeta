import { useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";

import { ActionPill } from "@/src/components/dashboard/action-pill";
import { MealCard } from "@/src/components/dashboard/meal-card";
import { ProgressMetricCard } from "@/src/components/dashboard/progress-metric-card";
import { WaterTrackerCard } from "@/src/components/dashboard/water-tracker-card";
import { WeightEntryCard } from "@/src/components/dashboard/weight-entry-card";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { ProgressBar } from "@/src/components/ui/progress-bar";
import { Screen } from "@/src/components/ui/screen";
import { SectionHeader } from "@/src/components/ui/section-header";
import { useToday } from "@/src/hooks/use-today";
import { calcWaterTargetGlasses } from "@/src/lib/psmf";
import { roundTo } from "@/src/lib/units";
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
import type { LoggedMeal, WeightEntry } from "@/src/types/app";

function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Dobro jutro";
  }

  if (hour < 18) {
    return "Dobar dan";
  }

  return "Dobro vece";
}

function getDayLabel(elapsedDays: number, totalDays: number | null) {
  const elapsed = `${Math.max(1, elapsedDays)}`.padStart(2, "0");

  if (totalDays === null) {
    return `DAN ${elapsed}`;
  }

  return `DAN ${elapsed} OD ${`${totalDays}`.padStart(2, "0")}`;
}

function getRemainingLabel(remainingDays: number | null) {
  if (remainingDays === null) {
    return "Plan bez roka";
  }

  if (remainingDays === 0) {
    return "Zavrsni dan";
  }

  if (remainingDays === 1) {
    return "1 dan preostao";
  }

  return `${remainingDays} dana preostalo`;
}

function getMealsSummary(mealCount: number, proteinConsumed: number) {
  const mealLabel = mealCount === 1 ? "obrok" : "obroka";
  return `${mealCount} ${mealLabel} - ${proteinConsumed}g proteina ukupno`;
}

function getWeightDelta(todayEntry: WeightEntry | null, previousEntry: WeightEntry | null) {
  if (!todayEntry || !previousEntry || previousEntry.date >= todayEntry.date) {
    return null;
  }

  return roundTo(todayEntry.kg - previousEntry.kg, 1);
}

export default function HomeRoute() {
  const data = usePsmfStore((store) => store.data);
  const clearStore = usePsmfStore((store) => store.clearStore);
  const setWaterGlasses = usePsmfStore((store) => store.setWaterGlasses);
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

  function showPhaseAlert(title: string, message: string) {
    Alert.alert(title, message);
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
  const greeting = getGreeting();
  const userLabel = data.userName || "sportista";
  const dayLabel = getDayLabel(protocol.elapsedDays, protocol.totalDays);
  const remainingLabel = getRemainingLabel(protocol.remainingDays);

  return (
    <Screen contentClassName="gap-5">
      <View className="gap-4">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-2">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted">
              {dayLabel}
            </Text>
            <Text className="text-[34px] font-black leading-10 text-text">
              {greeting}, {userLabel}
            </Text>
          </View>

          <Pressable
            className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-strong"
            onPress={() =>
              showPhaseAlert(
                "Plan protokola",
                `Danas je ${protocol.elapsedDays}. dan plana. ${remainingLabel}.`,
              )
            }
          >
            <Text className="text-xs font-bold uppercase tracking-[1px] text-warning">
              Plan
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <ProgressBar progress={protocol.progress} />
          </View>
          <Text className="text-sm text-muted">{remainingLabel}</Text>
        </View>
      </View>

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

      <View className="gap-3">
        <View className="flex-row items-end justify-between gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-2xl font-bold text-text">Danasnji obroci</Text>
            <Text className="text-sm text-muted">
              {getMealsSummary(meals.length, proteinConsumed)}
            </Text>
          </View>

          <ActionPill
            label="+ Dodaj obrok"
            onPress={() =>
              showPhaseAlert(
                "Dodavanje obroka",
                "Meal logger dolazi u fazi 6. Ovaj shell sada samo priprema mesto za njega.",
              )
            }
            variant="accent"
          />
        </View>

        {meals.length ? (
          meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onDelete={(entry: LoggedMeal) => {
                showPhaseAlert(
                  "Brisanje obroka",
                  `Brisanje i izmena obroka stizu u fazi 6. "${entry.name}" je trenutno samo prikazan u shell-u.`,
                );
              }}
              onEdit={(entry: LoggedMeal) => {
                showPhaseAlert(
                  "Izmena obroka",
                  `Izmena obroka "${entry.name}" dolazi u fazi 6.`,
                );
              }}
            />
          ))
        ) : (
          <Card className="gap-2">
            <Text className="text-lg font-bold text-text">Jos nema obroka za danas</Text>
            <Text className="text-sm leading-6 text-muted">
              Dodavanje i izmena obroka dolaze u sledecoj fazi. Ovaj ekran je sada spreman
              da prikaze stvarne obroke cim meal logger bude zavrsen.
            </Text>
          </Card>
        )}
      </View>

      <WeightEntryCard
        deltaKg={todayWeightDelta}
        onPress={() =>
          showPhaseAlert(
            "Unos tezine",
            todayEntry
              ? "Izmena danasnje tezine dolazi u fazi 5."
              : "Dnevni unos tezine dolazi u fazi 5.",
          )
        }
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
