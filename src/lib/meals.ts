import { MEAL_SUPPLEMENT_DEFINITIONS } from "@/src/constants/protocol";
import { FOOD_DB } from "@/src/constants/food-db";
import type {
  FoodBasis,
  FoodItem,
  FoodKind,
  LoggedMeal,
  LoggedMealItem,
  MealSupplementKey,
  MealSupplements,
} from "@/src/types/app";

export type MealSelection = {
  foodId: string;
  grams: number;
};

export const MEAL_SUPPLEMENT_KEYS: MealSupplementKey[] = [
  "omega3WithMeal",
  "potassiumSalted",
  "multivitamin",
  "calcium",
  "magnesium",
];

export const EMPTY_MEAL_SUPPLEMENTS: MealSupplements = {
  omega3WithMeal: false,
  potassiumSalted: false,
  multivitamin: false,
  calcium: false,
  magnesium: false,
};

const PRIORITY_ORDER = {
  tierA: 0,
  tierB: 1,
  limited: 2,
  condiment: 3,
} as const;

const BASIS_LABELS: Record<FoodBasis, string> = {
  raw: "sirovo",
  drained: "ocedjeno",
  asPackaged: "pakovanje",
};

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyMealSupplements(): MealSupplements {
  return { ...EMPTY_MEAL_SUPPLEMENTS };
}

export function getMealSupplements(
  meal: Pick<LoggedMeal, "supplements"> | null | undefined,
) {
  return {
    ...createEmptyMealSupplements(),
    ...(meal?.supplements ?? {}),
  };
}

export function getBasisLabel(basis: FoodBasis) {
  return BASIS_LABELS[basis];
}

export function findFoodItem(foodId: string | null) {
  if (!foodId) {
    return null;
  }

  return FOOD_DB.find((item) => item.id === foodId) ?? null;
}

export function getFoodsByKind(kind: FoodKind) {
  return FOOD_DB.filter((item) => item.kind === kind).sort((left, right) => {
    const priorityDiff =
      PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return left.label.localeCompare(right.label);
  });
}

export function calcMealValue(baseValue: number, grams: number) {
  return Math.round((baseValue * grams) / 100);
}

export function buildMealItem(
  food: FoodItem,
  grams: number,
): LoggedMealItem {
  return {
    id: createId("meal-item"),
    foodId: food.id,
    kind: food.kind,
    label: food.label,
    grams,
    proteinG: calcMealValue(food.proteinPer100g, grams),
    calories: calcMealValue(food.caloriesPer100g, grams),
  };
}

export function buildMealItems(selections: MealSelection[]) {
  return selections
    .map((selection) => {
      const food = findFoodItem(selection.foodId);
      if (!food || selection.grams <= 0) {
        return null;
      }

      return buildMealItem(food, selection.grams);
    })
    .filter((item): item is LoggedMealItem => item !== null);
}

export function sumLoggedMealItems(items: LoggedMealItem[]) {
  return items.reduce(
    (totals, item) => ({
      proteinG: totals.proteinG + item.proteinG,
      calories: totals.calories + item.calories,
    }),
    { proteinG: 0, calories: 0 },
  );
}

export function getNextMealName(meals: LoggedMeal[], editingMealId?: string) {
  if (editingMealId) {
    const existing = meals.find((meal) => meal.id === editingMealId);
    if (existing) {
      return existing.name;
    }
  }

  return `Obrok ${meals.length + 1}`;
}

export function buildLoggedMeal(params: {
  date: string;
  mealsForDate: LoggedMeal[];
  proteins: MealSelection[];
  vegetables: MealSelection[];
  condiments: MealSelection[];
  supplements: MealSupplements;
  existingMeal?: LoggedMeal | null;
}) {
  const items = buildMealItems([
    ...params.proteins,
    ...params.vegetables,
    ...params.condiments,
  ]);
  const totals = sumLoggedMealItems(items);

  return {
    id: params.existingMeal?.id ?? createId("meal"),
    name: getNextMealName(params.mealsForDate, params.existingMeal?.id),
    date: params.date,
    items,
    supplements: { ...params.supplements },
    proteinG: totals.proteinG,
    calories: totals.calories,
  };
}

export function getSelectionsFromMeal(
  meal: LoggedMeal | null | undefined,
  kind: FoodKind,
): MealSelection[] {
  return (
    meal?.items
      .filter((entry) => entry.kind === kind)
      .map((entry) => ({
        foodId: entry.foodId,
        grams: entry.grams,
      })) ?? []
  );
}

export function addMealSelection(
  selections: MealSelection[],
  foodId: string,
  grams: number,
) {
  if (selections.some((selection) => selection.foodId === foodId)) {
    return selections;
  }

  return [...selections, { foodId, grams }];
}

export function updateMealSelectionGrams(
  selections: MealSelection[],
  foodId: string,
  grams: number,
) {
  return selections.map((selection) =>
    selection.foodId === foodId ? { ...selection, grams } : selection,
  );
}

export function removeMealSelection(
  selections: MealSelection[],
  foodId: string,
) {
  return selections.filter((selection) => selection.foodId !== foodId);
}

export function findMealSelection(
  selections: MealSelection[],
  foodId: string | null,
) {
  if (!foodId) {
    return null;
  }

  return selections.find((selection) => selection.foodId === foodId) ?? null;
}

export function countSupplementsForDate(
  meals: LoggedMeal[],
  excludedMealId?: string,
) {
  const counts = Object.fromEntries(
    MEAL_SUPPLEMENT_KEYS.map((key) => [key, 0]),
  ) as Record<MealSupplementKey, number>;

  for (const meal of meals) {
    if (meal.id === excludedMealId) {
      continue;
    }

    const supplements = getMealSupplements(meal);
    for (const key of MEAL_SUPPLEMENT_KEYS) {
      if (supplements[key]) {
        counts[key] += 1;
      }
    }
  }

  return counts;
}

export function getAvailableMealSupplementDefinitions(
  meals: LoggedMeal[],
  excludedMealId: string | undefined,
  currentSupplements: MealSupplements,
) {
  const counts = countSupplementsForDate(meals, excludedMealId);

  return MEAL_SUPPLEMENT_DEFINITIONS.filter((definition) => {
    if (definition.dailyLimit === null) {
      return true;
    }

    return currentSupplements[definition.key] || counts[definition.key] < definition.dailyLimit;
  });
}
