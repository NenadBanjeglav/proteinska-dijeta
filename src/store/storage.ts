import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createEmptyMealSupplements,
  getMealSupplements,
  normalizeMealName,
} from "@/src/lib/meals";
import { getMealTemplateSignature } from "@/src/lib/meal-templates";
import { sortWeightHistory } from "@/src/lib/date";
import type {
  Activity,
  Gender,
  LoggedMeal,
  LoggedMealItemKind,
  LoggedMealItem,
  MealTemplate,
  MealSupplements,
  OnboardingProfile,
  PlanSettingsUpdate,
  PSMFStore,
  WeightEntry,
} from "@/src/types/app";

export const STORAGE_KEY = "psmf_store";

const GENDERS = new Set<Gender>(["male", "female"]);
const ACTIVITIES = new Set<Activity>(["inactive", "aerobics", "weights"]);
const MEAL_KINDS = new Set(["protein", "vegetable", "fruit", "condiment"]);
const MAX_REMEMBERED_FOOD_GRAMS = 2000;

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
  goalTotalDays: null,
  weightHistory: [],
  meals: [],
  mealTemplates: [],
  favoriteFoodIds: [],
  foodGramsById: {},
  waterGlassesByDate: {},
};

function cloneDefaultStore(): PSMFStore {
  return {
    ...DEFAULT_STORE,
    weightHistory: [],
    meals: [],
    mealTemplates: [],
    favoriteFoodIds: [],
    foodGramsById: {},
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

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
    carbsG: isNumber(value.carbsG) ? value.carbsG : 0,
    fatG: isNumber(value.fatG) ? value.fatG : 0,
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

  const itemTotals = items.reduce(
    (totals, item) => ({
      carbsG: totals.carbsG + item.carbsG,
      fatG: totals.fatG + item.fatG,
    }),
    { carbsG: 0, fatG: 0 },
  );

  return {
    id: value.id,
    name: value.name,
    customName: isString(value.customName) ? value.customName : null,
    items,
    supplements: parseMealSupplements(value.supplements),
    proteinG: value.proteinG,
    carbsG: isNumber(value.carbsG) ? value.carbsG : itemTotals.carbsG,
    fatG: isNumber(value.fatG) ? value.fatG : itemTotals.fatG,
    calories: value.calories,
    date: value.date,
  };
}

function parseMealTemplate(value: unknown): MealTemplate | null {
  if (!isRecord(value) || !isString(value.id) || !isString(value.name)) {
    return null;
  }

  const items = Array.isArray(value.items)
    ? value.items.map(parseMealItem).filter(isDefined)
    : [];

  if (!items.length || !isNumber(value.proteinG) || !isNumber(value.calories)) {
    return null;
  }

  const itemTotals = items.reduce(
    (totals, item) => ({
      carbsG: totals.carbsG + item.carbsG,
      fatG: totals.fatG + item.fatG,
    }),
    { carbsG: 0, fatG: 0 },
  );

  return {
    id: value.id,
    name: value.name,
    customName: isString(value.customName) ? value.customName : null,
    items,
    proteinG: value.proteinG,
    carbsG: isNumber(value.carbsG) ? value.carbsG : itemTotals.carbsG,
    fatG: isNumber(value.fatG) ? value.fatG : itemTotals.fatG,
    calories: value.calories,
    createdAt: isString(value.createdAt) ? value.createdAt : "",
    updatedAt: isString(value.updatedAt) ? value.updatedAt : "",
  };
}

function sanitizeFoodGramsById(value: unknown) {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, number>>(
    (accumulator, [foodId, grams]) => {
      if (!isNumber(grams) || grams <= 0 || grams > MAX_REMEMBERED_FOOD_GRAMS) {
        return accumulator;
      }

      accumulator[foodId] = Math.round(grams);
      return accumulator;
    },
    {},
  );
}

function getFoodGramsFromMeal(meal: LoggedMeal) {
  return meal.items.reduce<Record<string, number>>((accumulator, item) => {
    if (item.grams > 0 && item.grams <= MAX_REMEMBERED_FOOD_GRAMS) {
      accumulator[item.foodId] = Math.round(item.grams);
    }

    return accumulator;
  }, {});
}

function getFoodGramsFromMeals(meals: LoggedMeal[]) {
  const sortedMeals = [...meals].sort((left, right) => {
    if (left.date !== right.date) {
      return left.date.localeCompare(right.date);
    }

    return left.id.localeCompare(right.id);
  });

  return sortedMeals.reduce<Record<string, number>>(
    (accumulator, meal) => ({
      ...accumulator,
      ...getFoodGramsFromMeal(meal),
    }),
    {},
  );
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
  const mealTemplates = Array.isArray(value.mealTemplates)
    ? value.mealTemplates.map(parseMealTemplate).filter(isDefined)
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
  const favoriteFoodIds = Array.isArray(value.favoriteFoodIds)
    ? value.favoriteFoodIds.filter(isString)
    : [];
  const persistedFoodGramsById = sanitizeFoodGramsById(value.foodGramsById);
  const foodGramsById = Object.keys(persistedFoodGramsById).length
    ? persistedFoodGramsById
    : getFoodGramsFromMeals(meals);

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
    goalTotalDays: isNumber(value.goalTotalDays) ? value.goalTotalDays : null,
    weightHistory: ensureStartWeightEntry(weightHistory, startDate, startingWeightKg),
    meals,
    mealTemplates,
    favoriteFoodIds,
    foodGramsById,
    waterGlassesByDate,
  };
}

async function writeStore(store: PSMFStore) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return store;
}

// AsyncStorage writes can overlap from different UI actions; serialize mutations
// so every write sees the latest persisted state instead of clobbering it.
let pendingStoreMutation = Promise.resolve();

function queueStoreMutation<T>(mutation: () => Promise<T>) {
  const nextMutation = pendingStoreMutation
    .catch(() => undefined)
    .then(mutation);

  pendingStoreMutation = nextMutation.then(
    () => undefined,
    () => undefined,
  );

  return nextMutation;
}

async function updateStore(recipe: (store: PSMFStore) => PSMFStore) {
  return queueStoreMutation(async () => {
    const current = await getStore();
    const next = recipe(current);
    return writeStore(next);
  });
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
      goalTotalDays: profile.goalTotalDays,
      weightHistory: ensureStartWeightEntry(
        store.weightHistory,
        nextStartDate,
        nextStartingWeightKg,
      ),
    };
  });
}

export async function updatePlanSettings(input: PlanSettingsUpdate) {
  return updateStore((store) => ({
    ...store,
    userName: input.userName,
    goalWeightKg: input.goalWeightKg,
    proteinTargetG: input.proteinTargetG,
    dismissedProteinChangeKey: null,
    gender: input.gender,
    bodyFatPct: input.bodyFatPct,
    activity: input.activity,
    goalTotalDays: input.goalTotalDays,
  }));
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
      foodGramsById: {
        ...store.foodGramsById,
        ...getFoodGramsFromMeal(nextMeal),
      },
    };
  });
}

export async function saveMealTemplate(meal: LoggedMeal) {
  return updateStore((store) => {
    const now = new Date().toISOString();
    const signature = getMealTemplateSignature(meal);
    const existingTemplate = store.mealTemplates.find(
      (template) => getMealTemplateSignature(template) === signature,
    );
    const nextTemplate: MealTemplate = {
      id: existingTemplate?.id ?? createId("meal-template"),
      name: meal.name,
      customName: meal.customName,
      items: meal.items,
      proteinG: meal.proteinG,
      carbsG: meal.carbsG,
      fatG: meal.fatG,
      calories: meal.calories,
      createdAt: existingTemplate?.createdAt || now,
      updatedAt: now,
    };
    const rest = store.mealTemplates.filter(
      (template) => template.id !== nextTemplate.id,
    );

    return {
      ...store,
      mealTemplates: [nextTemplate, ...rest],
    };
  });
}

export async function deleteMealTemplate(templateId: string) {
  return updateStore((store) => ({
    ...store,
    mealTemplates: store.mealTemplates.filter(
      (template) => template.id !== templateId,
    ),
  }));
}

export async function renameMealTemplate(templateId: string, name: string) {
  const nextName = normalizeMealName(name);
  if (!nextName) {
    return getStore();
  }

  return updateStore((store) => ({
    ...store,
    mealTemplates: store.mealTemplates.map((template) =>
      template.id === templateId
        ? {
            ...template,
            name: nextName,
            customName: nextName,
            updatedAt: new Date().toISOString(),
          }
        : template,
    ),
  }));
}

export async function deleteMeal(mealId: string) {
  return updateStore((store) => ({
    ...store,
    meals: store.meals.filter((meal) => meal.id !== mealId),
  }));
}

export async function toggleFavoriteFood(foodId: string) {
  return updateStore((store) => {
    const favoriteFoodIds = store.favoriteFoodIds.includes(foodId)
      ? store.favoriteFoodIds.filter((currentId) => currentId !== foodId)
      : [...store.favoriteFoodIds, foodId];

    return {
      ...store,
      favoriteFoodIds,
    };
  });
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
  return queueStoreMutation(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return cloneDefaultStore();
  });
}
