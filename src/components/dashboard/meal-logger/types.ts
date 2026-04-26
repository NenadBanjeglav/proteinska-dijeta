import type { MealSelectionItem } from "@/src/hooks/use-meal-builder";
import type { FoodKind, MealSupplementKey } from "@/src/types/app";

export type FoodFilterKey = "all" | FoodKind;

export type SelectedMealRow = MealSelectionItem & {
  kind: FoodKind;
  proteinG: number;
  calories: number;
};

export type MealSupplementDefinition = {
  key: MealSupplementKey;
  label: string;
  description: string;
  dailyLimit: number | null;
};

export const FOOD_FILTERS: { key: FoodFilterKey; label: string }[] = [
  { key: "all", label: "Sve" },
  { key: "protein", label: "Protein" },
  { key: "vegetable", label: "Povrce" },
  { key: "fruit", label: "Voce" },
  { key: "condiment", label: "Dodaci" },
];

export const KIND_LABELS: Record<FoodKind, string> = {
  protein: "Protein",
  vegetable: "Povrce",
  fruit: "Voce",
  condiment: "Dodatak",
};

export const KIND_TONES: Record<FoodKind, string> = {
  protein: "text-success",
  vegetable: "text-accent",
  fruit: "text-warning",
  condiment: "text-muted-strong",
};
