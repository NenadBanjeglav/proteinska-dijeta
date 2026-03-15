import { calcEstimatedCalories } from "@/src/lib/psmf";
import { getElapsedDays, getTodayDate, sortWeightHistory } from "@/src/lib/date";
import type { LoggedMeal, PSMFStore, WeightEntry } from "@/src/types/app";

export function selectIsOnboarded(store: PSMFStore) {
  return store.startingWeightKg !== null;
}

export function selectWeightHistory(store: PSMFStore) {
  return sortWeightHistory(store.weightHistory);
}

export function selectTodayEntry(store: PSMFStore, date = getTodayDate()) {
  return store.weightHistory.find((entry) => entry.date === date) ?? null;
}

export function selectPreviousEntry(store: PSMFStore, date = getTodayDate()) {
  const previous = [...store.weightHistory]
    .filter((entry) => entry.date < date)
    .sort((left, right) => right.date.localeCompare(left.date))[0];

  if (previous) {
    return previous;
  }

  return store.startingWeightKg === null
    ? null
    : {
        date: store.startDate ?? date,
        kg: store.startingWeightKg,
      };
}

export function selectCurrentWeightKg(store: PSMFStore) {
  const history = selectWeightHistory(store);
  return history[history.length - 1]?.kg ?? store.startingWeightKg;
}

export function selectMealsByDate(store: PSMFStore, date = getTodayDate()) {
  return store.meals.filter((meal) => meal.date === date);
}

export function sumMealProtein(meals: LoggedMeal[]) {
  return meals.reduce((total, meal) => total + meal.proteinG, 0);
}

export function sumMealCalories(meals: LoggedMeal[]) {
  return meals.reduce((total, meal) => total + meal.calories, 0);
}

export function selectProteinConsumed(store: PSMFStore, date = getTodayDate()) {
  return sumMealProtein(selectMealsByDate(store, date));
}

export function selectCaloriesConsumed(store: PSMFStore, date = getTodayDate()) {
  return sumMealCalories(selectMealsByDate(store, date));
}

export function selectEstimatedCalorieTarget(store: PSMFStore) {
  return store.proteinTargetG === null ? null : calcEstimatedCalories(store.proteinTargetG);
}

export function selectWaterGlasses(store: PSMFStore, date = getTodayDate()) {
  return store.waterGlassesByDate[date] ?? 0;
}

export function selectProtocolProgress(store: PSMFStore, today = getTodayDate()) {
  if (!store.startDate || !store.goalTotalDays) {
    return {
      elapsedDays: 0,
      totalDays: null,
      remainingDays: null,
      progress: 0,
    };
  }

  const elapsedDays = getElapsedDays(store.startDate, today);
  const progress = Math.min(1, elapsedDays / store.goalTotalDays);

  return {
    elapsedDays,
    totalDays: store.goalTotalDays,
    remainingDays: Math.max(0, store.goalTotalDays - elapsedDays),
    progress,
  };
}

export function selectChartEntries(store: PSMFStore): WeightEntry[] {
  return selectWeightHistory(store);
}
