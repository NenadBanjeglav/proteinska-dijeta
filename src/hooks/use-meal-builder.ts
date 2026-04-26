import { useEffect, useMemo, useState } from "react";

import {
  addMealSelection,
  buildMealSelectionItems,
  buildLoggedMeal,
  createEmptyMealSupplements,
  findFoodItem,
  findMealSelection,
  getAvailableMealSupplementDefinitions,
  getMealSupplements,
  getRecentFoodIdsByKind,
  normalizeMealName,
  removeMealSelection,
  updateMealSelectionGrams,
  type MealSelection,
} from "@/src/lib/meals";
import type {
  LoggedMeal,
  LoggedMealItem,
  MealTemplate,
  MealSupplementKey,
  MealSupplements,
} from "@/src/types/app";

type SelectableMealSectionKey = "protein" | "vegetable" | "fruit" | "condiment";

export type MealSectionKey = SelectableMealSectionKey | "supplements";

export type MealAmountTarget = {
  kind: SelectableMealSectionKey;
  foodId: string;
  initialGrams: number;
} | null;

export type MealSelectionItem = MealSelection & {
  label: string;
};

type MealSelections = Record<SelectableMealSectionKey, MealSelection[]>;

type MealSelectionItems = Record<SelectableMealSectionKey, MealSelectionItem[]>;
type MealDraftSource = {
  items: LoggedMealItem[];
  customName: string | null;
};

type UseMealBuilderParams = {
  open: boolean;
  date: string;
  mealsForDate: LoggedMeal[];
  meal: LoggedMeal | null;
  template: MealTemplate | null;
  allMeals: LoggedMeal[];
  foodGramsById: Record<string, number>;
  onSave: (meal: LoggedMeal) => Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export const DEFAULT_MEAL_GRAMS: Record<SelectableMealSectionKey, number> = {
  protein: 150,
  vegetable: 150,
  fruit: 100,
  condiment: 20,
};

function createEmptySelections(): MealSelections {
  return {
    protein: [],
    vegetable: [],
    fruit: [],
    condiment: [],
  };
}

function getSelectionsFromSource(
  source: MealDraftSource | null | undefined,
  kind: SelectableMealSectionKey,
): MealSelection[] {
  return (
    source?.items
      .filter((entry) => entry.kind === kind)
      .map((entry) => ({
        foodId: entry.foodId,
        grams: entry.grams,
      })) ?? []
  );
}

export function useMealBuilder({
  open,
  date,
  mealsForDate,
  meal,
  template,
  allMeals,
  foodGramsById,
  onSave,
  onOpenChange,
}: UseMealBuilderParams) {
  const [selections, setSelections] = useState<MealSelections>(createEmptySelections);
  const [supplements, setSupplements] = useState<MealSupplements>(
    createEmptyMealSupplements(),
  );
  const [draftName, setDraftName] = useState("");
  const [activeSection, setActiveSection] = useState<MealSectionKey>("protein");
  const [isSaving, setIsSaving] = useState(false);
  const [amountTarget, setAmountTarget] = useState<MealAmountTarget>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const source = meal ?? template;

    setSelections({
      protein: getSelectionsFromSource(source, "protein"),
      vegetable: getSelectionsFromSource(source, "vegetable"),
      fruit: getSelectionsFromSource(source, "fruit"),
      condiment: getSelectionsFromSource(source, "condiment"),
    });
    setSupplements(meal ? getMealSupplements(meal) : createEmptyMealSupplements());
    setDraftName(source?.customName ?? "");
    setActiveSection("protein");
    setIsSaving(false);
    setAmountTarget(null);
  }, [meal, open, template]);

  const previewMeal = useMemo(() => {
    const hasAnySelection = Object.values(selections).some(
      (sectionSelections) => sectionSelections.length > 0,
    );

    if (!hasAnySelection) {
      return null;
    }

    return buildLoggedMeal({
      date,
      mealsForDate,
      proteins: selections.protein,
      vegetables: selections.vegetable,
      fruits: selections.fruit,
      condiments: selections.condiment,
      supplements,
      customName: draftName,
      existingMeal: meal,
    });
  }, [date, draftName, meal, mealsForDate, selections, supplements]);

  const selectionItems = useMemo<MealSelectionItems>(
    () => ({
      protein: buildMealSelectionItems(selections.protein),
      vegetable: buildMealSelectionItems(selections.vegetable),
      fruit: buildMealSelectionItems(selections.fruit),
      condiment: buildMealSelectionItems(selections.condiment),
    }),
    [selections],
  );

  const sectionCounts = useMemo(
    () => ({
      protein: selectionItems.protein.length,
      vegetable: selectionItems.vegetable.length,
      fruit: selectionItems.fruit.length,
      condiment: selectionItems.condiment.length,
      supplements: Object.values(supplements).filter(Boolean).length,
    }),
    [selectionItems, supplements],
  );

  const availableSupplementDefinitions = useMemo(
    () => getAvailableMealSupplementDefinitions(mealsForDate, meal?.id, supplements),
    [meal?.id, mealsForDate, supplements],
  );

  const recentFoodIdsByKind = useMemo(
    () => ({
      protein: getRecentFoodIdsByKind(allMeals, "protein"),
      vegetable: getRecentFoodIdsByKind(allMeals, "vegetable"),
      fruit: getRecentFoodIdsByKind(allMeals, "fruit"),
      condiment: getRecentFoodIdsByKind(allMeals, "condiment"),
    }),
    [allMeals],
  );

  const amountFood = useMemo(
    () => findFoodItem(amountTarget?.foodId ?? null),
    [amountTarget?.foodId],
  );
  const customName = useMemo(() => normalizeMealName(draftName), [draftName]);
  const canSave = !!previewMeal?.items.length;

  function updateSelections(
    kind: SelectableMealSectionKey,
    updater: (current: MealSelection[]) => MealSelection[],
  ) {
    setSelections((current) => ({
      ...current,
      [kind]: updater(current[kind]),
    }));
  }

  function getDefaultGrams(kind: SelectableMealSectionKey, foodId: string) {
    const rememberedGrams = foodGramsById[foodId];

    if (rememberedGrams > 0) {
      return rememberedGrams;
    }

    return DEFAULT_MEAL_GRAMS[kind];
  }

  function openAmountSheet(kind: SelectableMealSectionKey, foodId: string) {
    const existingSelection = findMealSelection(selections[kind], foodId);

    setAmountTarget({
      kind,
      foodId,
      initialGrams: existingSelection?.grams ?? getDefaultGrams(kind, foodId),
    });
  }

  function handleSelectFood(kind: SelectableMealSectionKey, foodId: string) {
    const existingSelection = findMealSelection(selections[kind], foodId);

    if (!existingSelection) {
      updateSelections(kind, (current) =>
        addMealSelection(current, foodId, getDefaultGrams(kind, foodId)),
      );
      return;
    }

    openAmountSheet(kind, foodId);
  }

  function handleSaveGrams(grams: number) {
    if (!amountTarget) {
      return;
    }

    updateSelections(amountTarget.kind, (current) => {
      const existingSelection = findMealSelection(current, amountTarget.foodId);

      if (!existingSelection) {
        return addMealSelection(current, amountTarget.foodId, grams);
      }

      return updateMealSelectionGrams(current, amountTarget.foodId, grams);
    });
    setAmountTarget(null);
  }

  function handleRemoveSelection(kind: SelectableMealSectionKey, foodId: string) {
    updateSelections(kind, (current) => removeMealSelection(current, foodId));

    if (amountTarget?.kind === kind && amountTarget.foodId === foodId) {
      setAmountTarget(null);
    }
  }

  function clearSelections(kind: SelectableMealSectionKey) {
    setSelections((current) => ({
      ...current,
      [kind]: [],
    }));

    if (amountTarget?.kind === kind) {
      setAmountTarget(null);
    }
  }

  function adjustSelectionAmount(
    kind: SelectableMealSectionKey,
    foodId: string,
    delta: number,
  ) {
    updateSelections(kind, (current) => {
      const selection = findMealSelection(current, foodId);
      if (!selection) {
        return current;
      }

      const nextGrams = selection.grams + delta;
      if (nextGrams <= 0) {
        return removeMealSelection(current, foodId);
      }

      return updateMealSelectionGrams(current, foodId, nextGrams);
    });
  }

  function toggleSupplement(key: MealSupplementKey) {
    setSupplements((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function applyMealDraft(sourceMeal: MealDraftSource) {
    setSelections({
      protein: getSelectionsFromSource(sourceMeal, "protein"),
      vegetable: getSelectionsFromSource(sourceMeal, "vegetable"),
      fruit: getSelectionsFromSource(sourceMeal, "fruit"),
      condiment: getSelectionsFromSource(sourceMeal, "condiment"),
    });
    setSupplements(createEmptyMealSupplements());
    setDraftName(sourceMeal.customName ?? "");
    setActiveSection("protein");
    setAmountTarget(null);
  }

  async function handleSave() {
    if (!previewMeal || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(previewMeal);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  return {
    activeSection,
    amountFood,
    amountTarget,
    availableSupplementDefinitions,
    canSave,
    clearSelections,
    customName,
    draftName,
    isSaving,
    previewMeal,
    recentFoodIdsByKind,
    sectionCounts,
    selectionItems,
    selections,
    setActiveSection,
    setAmountTarget,
    setDraftName,
    supplements,
    adjustSelectionAmount,
    handleRemoveSelection,
    handleSave,
    handleSaveGrams,
    handleSelectFood,
    openAmountSheet,
    toggleSupplement,
    applyMealDraft,
  };
}
