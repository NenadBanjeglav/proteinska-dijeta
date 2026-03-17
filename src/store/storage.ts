import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createEmptyMealSupplements,
  getMealSupplements,
} from "@/src/lib/meals";
import { sortWeightHistory } from "@/src/lib/date";
import type {
  Activity,
  Gender,
  GoalType,
  LoggedMeal,
  LoggedMealItemKind,
  LoggedMealItem,
  MealSupplements,
  OnboardingProfile,
  PSMFStore,
  WeightEntry,
} from "@/src/types/app";

export const STORAGE_KEY = "psmf_store";

const GENDERS = new Set<Gender>(["male", "female"]);
const ACTIVITIES = new Set<Activity>(["inactive", "aerobics", "weights"]);
const GOALS = new Set<GoalType>(["kickstart", "plateau", "event", "full"]);
const MEAL_KINDS = new Set(["protein", "vegetable", "condiment"]);

export const DEFAULT_STORE: PSMFStore = {
  userName: null,
  startDate: null,
  startingWeightKg: null,
  goalWeightKg: null,
  proteinTargetG: null,
  dismissedProteinChangeKey: null,
  gender: null,
  bodyFatPct: null,
  activity: null,
  goalType: null,
  goalTotalDays: null,
  weightHistory: [],
  meals: [],
  waterGlassesByDate: {},
};

function cloneDefaultStore(): PSMFStore {
  return {
    ...DEFAULT_STORE,
    weightHistory: [],
    meals: [],
    waterGlassesByDate: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

function ensureStartWeightEntry(
  weightHistory: WeightEntry[],
  startDate: string | null,
  startingWeightKg: number | null,
) {
  if (!startDate || !isNumber(startingWeightKg)) {
    return sortWeightHistory(weightHistory);
  }

  const hasStartEntry = weightHistory.some((entry) => entry.date === startDate);
  if (hasStartEntry) {
    return sortWeightHistory(weightHistory);
  }

  return sortWeightHistory([
    ...weightHistory,
    {
      date: startDate,
      kg: startingWeightKg,
    },
  ]);
}

function parseWeightEntry(value: unknown): WeightEntry | null {
  if (!isRecord(value) || !isString(value.date) || !isNumber(value.kg)) {
    return null;
  }

  return { date: value.date, kg: value.kg };
}

function parseMealItem(value: unknown): LoggedMealItem | null {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isString(value.foodId) ||
    !isString(value.kind) ||
    !MEAL_KINDS.has(value.kind) ||
    !isString(value.label) ||
    !isNumber(value.grams) ||
    !isNumber(value.proteinG) ||
    !isNumber(value.calories)
  ) {
    return null;
  }

  return {
    id: value.id,
    foodId: value.foodId,
    kind: value.kind as LoggedMealItemKind,
    label: value.label,
    grams: value.grams,
    proteinG: value.proteinG,
    calories: value.calories,
  };
}

function parseMealSupplements(value: unknown): MealSupplements {
  if (!isRecord(value)) {
    return createEmptyMealSupplements();
  }

  return {
    ...createEmptyMealSupplements(),
    omega3WithMeal: value.omega3WithMeal === true,
    potassiumSalted: value.potassiumSalted === true,
    multivitamin: value.multivitamin === true,
    calcium: value.calcium === true,
    magnesium: value.magnesium === true,
  };
}

function parseMeal(value: unknown): LoggedMeal | null {
  if (!isRecord(value) || !isString(value.id) || !isString(value.name) || !isString(value.date)) {
    return null;
  }

  const items = Array.isArray(value.items)
    ? value.items.map(parseMealItem).filter(isDefined)
    : [];

  if (!isNumber(value.proteinG) || !isNumber(value.calories)) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    items,
    supplements: parseMealSupplements(value.supplements),
    proteinG: value.proteinG,
    calories: value.calories,
    date: value.date,
  };
}

function sanitizeStore(value: unknown): PSMFStore {
  const fallback = cloneDefaultStore();
  if (!isRecord(value)) {
    return fallback;
  }

  const weightHistory = Array.isArray(value.weightHistory)
    ? value.weightHistory.map(parseWeightEntry).filter(isDefined)
    : [];
  const meals = Array.isArray(value.meals)
    ? value.meals.map(parseMeal).filter(isDefined)
    : [];
  const startDate = isString(value.startDate) ? value.startDate : null;
  const startingWeightKg = isNumber(value.startingWeightKg)
    ? value.startingWeightKg
    : null;
  const waterGlassesByDate = isRecord(value.waterGlassesByDate)
    ? Object.entries(value.waterGlassesByDate).reduce<Record<string, number>>(
        (accumulator, [key, count]) => {
          if (isNumber(count)) {
            accumulator[key] = count;
          }
          return accumulator;
        },
        {},
      )
    : {};

  return {
    ...fallback,
    userName: isString(value.userName) ? value.userName : null,
    startDate,
    startingWeightKg,
    goalWeightKg: isNumber(value.goalWeightKg) ? value.goalWeightKg : null,
    proteinTargetG: isNumber(value.proteinTargetG) ? value.proteinTargetG : null,
    dismissedProteinChangeKey: isString(value.dismissedProteinChangeKey)
      ? value.dismissedProteinChangeKey
      : null,
    gender: GENDERS.has(value.gender as Gender) ? (value.gender as Gender) : null,
    bodyFatPct: isNumber(value.bodyFatPct) ? value.bodyFatPct : null,
    activity: ACTIVITIES.has(value.activity as Activity) ? (value.activity as Activity) : null,
    goalType: GOALS.has(value.goalType as GoalType) ? (value.goalType as GoalType) : null,
    goalTotalDays: isNumber(value.goalTotalDays) ? value.goalTotalDays : null,
    weightHistory: ensureStartWeightEntry(weightHistory, startDate, startingWeightKg),
    meals,
    waterGlassesByDate,
  };
}

async function writeStore(store: PSMFStore) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return store;
}

async function updateStore(recipe: (store: PSMFStore) => PSMFStore) {
  const current = await getStore();
  const next = recipe(current);
  return writeStore(next);
}

export async function getStore() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneDefaultStore();
    }

    return sanitizeStore(JSON.parse(raw));
  } catch {
    return cloneDefaultStore();
  }
}

export async function saveOnboardingProfile(profile: OnboardingProfile) {
  return updateStore((store) => {
    const nextStartDate = profile.startDate;
    const nextStartingWeightKg = profile.startingWeightKg;

    return {
      ...store,
      userName: profile.userName,
      startDate: nextStartDate,
      startingWeightKg: nextStartingWeightKg,
      goalWeightKg: profile.goalWeightKg,
      proteinTargetG: profile.proteinTargetG,
      dismissedProteinChangeKey: null,
      gender: profile.gender,
      bodyFatPct: profile.bodyFatPct,
      activity: profile.activity,
      goalType: profile.goalType,
      goalTotalDays: profile.goalTotalDays,
      weightHistory: ensureStartWeightEntry(
        store.weightHistory,
        nextStartDate,
        nextStartingWeightKg,
      ),
    };
  });
}

export async function setGoalWeightKg(goalWeightKg: number) {
  return updateStore((store) => ({
    ...store,
    goalWeightKg,
  }));
}

export async function setDismissedProteinChangeKey(key: string | null) {
  return updateStore((store) => ({
    ...store,
    dismissedProteinChangeKey: key,
  }));
}

export async function saveWeightEntry(kg: number, date: string) {
  return updateStore((store) => {
    const rest = store.weightHistory.filter((entry) => entry.date !== date);
    return { ...store, weightHistory: sortWeightHistory([...rest, { date, kg }]) };
  });
}

export async function saveMeal(meal: LoggedMeal) {
  return updateStore((store) => {
    const nextMeal = {
      ...meal,
      supplements: getMealSupplements(meal),
    };
    const meals = store.meals.filter((entry) => entry.id !== meal.id);
    return {
      ...store,
      meals: [...meals, nextMeal].sort((left, right) => left.date.localeCompare(right.date)),
    };
  });
}

export async function deleteMeal(mealId: string) {
  return updateStore((store) => ({
    ...store,
    meals: store.meals.filter((meal) => meal.id !== mealId),
  }));
}

export async function setWaterGlasses(date: string, count: number) {
  return updateStore((store) => ({
    ...store,
    waterGlassesByDate: {
      ...store.waterGlassesByDate,
      [date]: Math.max(0, Math.round(count)),
    },
  }));
}

export async function clearStore() {
  await AsyncStorage.removeItem(STORAGE_KEY);
  return cloneDefaultStore();
}
