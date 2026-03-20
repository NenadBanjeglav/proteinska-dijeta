import {
  calcBodyFatPctFromLeanMass,
  calcEstimatedCalories,
  calcLeanBodyMassKg,
  calcProteinTarget,
  calcWeightAtBodyFatPct,
  getCategory,
  getCategoryLabel,
  getNextCategoryThresholdBodyFatPct,
} from "@/src/lib/psmf";
import { getElapsedDays, getTodayDate, sortWeightHistory } from "@/src/lib/date";
import { buildGoalProjection } from "@/src/lib/projection";
import type { LoggedMeal, PSMFStore, ProtocolCategory } from "@/src/types/app";

export type ProtocolContext = {
  weightKg: number;
  leanBodyMassKg: number;
  estimatedBodyFatPct: number;
  category: ProtocolCategory;
  categoryLabel: string;
  proteinTargetG: number;
  calorieTarget: number;
};

export type NextCategoryThreshold = {
  targetCategory: ProtocolCategory;
  targetCategoryLabel: string;
  bodyFatPct: number;
  weightKg: number;
};

export type ProteinTargetChangeBanner = {
  key: string;
  currentCategory: ProtocolCategory;
  currentCategoryLabel: string;
  previousCategory: ProtocolCategory;
  previousCategoryLabel: string;
  currentProteinTargetG: number;
  previousProteinTargetG: number;
  estimatedBodyFatPct: number;
};

function deriveProtocolContext(store: PSMFStore, weightKg: number): ProtocolContext | null {
  if (
    store.startingWeightKg === null ||
    store.bodyFatPct === null ||
    !store.gender ||
    !store.activity
  ) {
    return null;
  }

  const leanBodyMassKg = calcLeanBodyMassKg(store.startingWeightKg, store.bodyFatPct);
  const estimatedBodyFatPct = calcBodyFatPctFromLeanMass(weightKg, leanBodyMassKg);
  if (estimatedBodyFatPct === null) {
    return null;
  }

  const category = getCategory(store.gender, estimatedBodyFatPct);
  const proteinTargetG = calcProteinTarget(
    weightKg,
    estimatedBodyFatPct,
    store.gender,
    store.activity,
  );

  return {
    weightKg,
    leanBodyMassKg,
    estimatedBodyFatPct,
    category,
    categoryLabel: getCategoryLabel(category),
    proteinTargetG,
    calorieTarget: calcEstimatedCalories(proteinTargetG),
  };
}

export function selectIsOnboarded(store: PSMFStore) {
  return (
    !!store.startDate &&
    store.startingWeightKg !== null &&
    store.goalWeightKg !== null &&
    store.proteinTargetG !== null &&
    !!store.gender &&
    store.bodyFatPct !== null &&
    !!store.activity
  );
}

export function selectHasGoalWeight(store: PSMFStore) {
  return store.goalWeightKg !== null;
}

export function selectWeightHistory(store: PSMFStore) {
  return sortWeightHistory(store.weightHistory);
}

export function selectTodayEntry(store: PSMFStore, date = getTodayDate()) {
  const todayEntry = store.weightHistory.find((entry) => entry.date === date);
  if (todayEntry) {
    return todayEntry;
  }

  if (store.startDate === date && store.startingWeightKg !== null) {
    return {
      date: store.startDate,
      kg: store.startingWeightKg,
    };
  }

  return null;
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

export function selectCurrentProtocolContext(store: PSMFStore) {
  const currentWeightKg = selectCurrentWeightKg(store);
  if (currentWeightKg === null) {
    return null;
  }

  return deriveProtocolContext(store, currentWeightKg);
}

export function selectPreviousProtocolContext(store: PSMFStore, date = getTodayDate()) {
  const previousEntry = selectPreviousEntry(store, date);
  if (!previousEntry) {
    return null;
  }

  return deriveProtocolContext(store, previousEntry.kg);
}

export function selectCurrentProteinTargetG(store: PSMFStore) {
  return selectCurrentProtocolContext(store)?.proteinTargetG ?? null;
}

export function selectEstimatedCalorieTarget(store: PSMFStore) {
  return selectCurrentProtocolContext(store)?.calorieTarget ?? null;
}

export function selectNextCategoryThreshold(store: PSMFStore) {
  const currentContext = selectCurrentProtocolContext(store);
  if (!currentContext || !store.gender) {
    return null;
  }

  const nextThresholdBodyFatPct = getNextCategoryThresholdBodyFatPct(
    store.gender,
    currentContext.category,
  );
  if (nextThresholdBodyFatPct === null) {
    return null;
  }

  const weightKg = calcWeightAtBodyFatPct(
    currentContext.leanBodyMassKg,
    nextThresholdBodyFatPct,
  );
  if (weightKg === null) {
    return null;
  }

  const targetCategory = (currentContext.category - 1) as ProtocolCategory;

  return {
    targetCategory,
    targetCategoryLabel: getCategoryLabel(targetCategory),
    bodyFatPct: nextThresholdBodyFatPct,
    weightKg,
  } satisfies NextCategoryThreshold;
}

export function selectProteinTargetChangeBanner(store: PSMFStore, date = getTodayDate()) {
  const todayEntry = selectTodayEntry(store, date);
  if (!todayEntry || todayEntry.date !== date) {
    return null;
  }

  const currentContext = selectCurrentProtocolContext(store);
  const previousContext = selectPreviousProtocolContext(store, date);
  if (!currentContext || !previousContext) {
    return null;
  }

  if (currentContext.category === previousContext.category) {
    return null;
  }

  const key = [
    date,
    previousContext.category,
    currentContext.category,
    currentContext.proteinTargetG,
  ].join(":");

  if (store.dismissedProteinChangeKey === key) {
    return null;
  }

  return {
    key,
    currentCategory: currentContext.category,
    currentCategoryLabel: currentContext.categoryLabel,
    previousCategory: previousContext.category,
    previousCategoryLabel: previousContext.categoryLabel,
    currentProteinTargetG: currentContext.proteinTargetG,
    previousProteinTargetG: previousContext.proteinTargetG,
    estimatedBodyFatPct: currentContext.estimatedBodyFatPct,
  } satisfies ProteinTargetChangeBanner;
}

export function selectGoalProgress(store: PSMFStore) {
  if (store.startingWeightKg === null || store.goalWeightKg === null) {
    return null;
  }

  const currentWeightKg = selectCurrentWeightKg(store);
  if (currentWeightKg === null) {
    return null;
  }

  const totalGapKg = store.startingWeightKg - store.goalWeightKg;
  if (totalGapKg <= 0) {
    return null;
  }

  const gapClosedKg = Math.max(0, store.startingWeightKg - currentWeightKg);
  const remainingKg = Math.max(0, currentWeightKg - store.goalWeightKg);

  return {
    totalGapKg,
    gapClosedKg,
    remainingKg,
    progress: Math.min(1, gapClosedKg / totalGapKg),
  };
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

export function selectGoalProjection(store: PSMFStore, today = getTodayDate()) {
  const currentContext = selectCurrentProtocolContext(store);
  if (!store.startDate || store.goalWeightKg === null || !store.gender || !store.activity) {
    return null;
  }

  if (!currentContext) {
    return null;
  }

  return buildGoalProjection({
    startDate: today,
    currentWeightKg: currentContext.weightKg,
    goalWeightKg: store.goalWeightKg,
    leanBodyMassKg: currentContext.leanBodyMassKg,
    gender: store.gender,
    activity: store.activity,
  });
}
