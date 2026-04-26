import type { LoggedMeal, LoggedMealItem, MealTemplate } from "@/src/types/app";

type MealTemplateSource = Pick<LoggedMeal, "items"> | Pick<MealTemplate, "items">;

export function getMealItemsSignature(
  items: Pick<LoggedMealItem, "foodId" | "grams">[],
) {
  return items
    .map((item) => `${item.foodId}:${Math.round(item.grams)}`)
    .sort()
    .join("|");
}

export function getMealTemplateSignature(source: MealTemplateSource) {
  return getMealItemsSignature(source.items);
}

export function isMealSavedAsTemplate(
  templates: MealTemplate[],
  meal: Pick<LoggedMeal, "items">,
) {
  const mealSignature = getMealTemplateSignature(meal);

  return templates.some(
    (template) => getMealTemplateSignature(template) === mealSignature,
  );
}
