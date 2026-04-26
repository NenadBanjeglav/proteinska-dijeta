import { getFoodsByKind } from "@/src/lib/meals";
import type { MealSelectionItem } from "@/src/hooks/use-meal-builder";
import type { FoodItem, FoodKind, LoggedMeal } from "@/src/types/app";

import type { SelectedMealRow } from "@/src/components/dashboard/meal-logger/types";

export const PROTEIN_FOODS = getFoodsByKind("protein");
export const VEGETABLE_FOODS = getFoodsByKind("vegetable");
export const FRUIT_FOODS = getFoodsByKind("fruit");
export const CONDIMENT_FOODS = getFoodsByKind("condiment");
export const ALL_FOODS = [
  ...PROTEIN_FOODS,
  ...VEGETABLE_FOODS,
  ...FRUIT_FOODS,
  ...CONDIMENT_FOODS,
];

function normalizeSearchTerm(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/dj/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesFoodQuery(food: FoodItem, query: string) {
  const normalizedQuery = normalizeSearchTerm(query);
  if (!normalizedQuery) {
    return true;
  }

  return normalizeSearchTerm(food.label).includes(normalizedQuery);
}

export function getFoodsFromIds(ids: string[], foodById: Map<string, FoodItem>) {
  const foods: FoodItem[] = [];
  const seen = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      continue;
    }

    const food = foodById.get(id);
    if (!food) {
      continue;
    }

    seen.add(id);
    foods.push(food);
  }

  return foods;
}

export function buildSelectedRows(
  selectionItems: Record<FoodKind, MealSelectionItem[]>,
  previewMeal: LoggedMeal | null,
): SelectedMealRow[] {
  const itemStatsByFoodId = new Map(
    previewMeal?.items.map((item) => [item.foodId, item]) ?? [],
  );

  return (Object.keys(selectionItems) as FoodKind[]).flatMap((kind) =>
    selectionItems[kind].map((selection) => {
      const itemStats = itemStatsByFoodId.get(selection.foodId);

      return {
        ...selection,
        kind,
        proteinG: itemStats?.proteinG ?? 0,
        calories: itemStats?.calories ?? 0,
      };
    }),
  );
}

export function buildRecentMealChoices(
  meals: LoggedMeal[],
  excludedMealId?: string | null,
) {
  const seen = new Set<string>();
  const choices: LoggedMeal[] = [];
  const sortedMeals = [...meals].sort((left, right) => {
    if (left.date !== right.date) {
      return right.date.localeCompare(left.date);
    }

    return right.id.localeCompare(left.id);
  });

  for (const meal of sortedMeals) {
    if (meal.id === excludedMealId || !meal.items.length) {
      continue;
    }

    const signature = meal.items
      .map((item) => `${item.foodId}:${item.grams}`)
      .sort()
      .join("|");

    if (seen.has(signature)) {
      continue;
    }

    seen.add(signature);
    choices.push(meal);

    if (choices.length >= 4) {
      return choices;
    }
  }

  return choices;
}
