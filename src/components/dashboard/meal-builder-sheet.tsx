import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { FoodAmountSheet } from "@/src/components/dashboard/food-amount-sheet";
import { FoodSearchPanel } from "@/src/components/dashboard/meal-logger/food-search-panel";
import { MealNameControl } from "@/src/components/dashboard/meal-logger/meal-name-control";
import { SelectedFoodsSection } from "@/src/components/dashboard/meal-logger/selected-foods-section";
import { SupplementControl } from "@/src/components/dashboard/meal-logger/supplement-control";
import {
  ALL_FOODS,
  PROTEIN_FOODS,
  buildRecentMealChoices,
  buildSelectedRows,
  getFoodsFromIds,
  matchesFoodQuery,
} from "@/src/components/dashboard/meal-logger/utils";
import { BottomSheet } from "@/src/components/ui/bottom-sheet";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { useMealBuilder } from "@/src/hooks/use-meal-builder";
import { formatKcal, formatMacroGrams } from "@/src/lib/units";
import { usePsmfStore } from "@/src/store/psmf-store";
import type { FoodItem, LoggedMeal, MealTemplate } from "@/src/types/app";
import type { FoodFilterKey } from "@/src/components/dashboard/meal-logger/types";

type MealBuilderSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  mealsForDate: LoggedMeal[];
  meal?: LoggedMeal | null;
  template?: MealTemplate | null;
  onSave: (meal: LoggedMeal) => Promise<void>;
};

export function MealBuilderSheet({
  open,
  onOpenChange,
  date,
  mealsForDate,
  meal = null,
  template = null,
  onSave,
}: MealBuilderSheetProps) {
  const allMeals = usePsmfStore((store) => store.data.meals);
  const mealTemplates = usePsmfStore((store) => store.data.mealTemplates);
  const favoriteFoodIds = usePsmfStore((store) => store.data.favoriteFoodIds);
  const foodGramsById = usePsmfStore((store) => store.data.foodGramsById);
  const toggleFavoriteFood = usePsmfStore((store) => store.toggleFavoriteFood);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FoodFilterKey>("all");
  const [nameEditorOpen, setNameEditorOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [supplementsOpen, setSupplementsOpen] = useState(false);
  const {
    amountFood,
    amountTarget,
    availableSupplementDefinitions,
    canSave,
    customName,
    draftName,
    isSaving,
    previewMeal,
    recentFoodIdsByKind,
    selectionItems,
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
  } = useMealBuilder({
    open,
    date,
    mealsForDate,
    meal,
    template,
    allMeals,
    foodGramsById,
    onSave,
    onOpenChange,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuery("");
    setActiveFilter("all");
    setNameEditorOpen((meal?.customName ?? template?.customName) ? true : false);
    setSearchFocused(false);
    setSupplementsOpen(false);
  }, [meal?.customName, open, template?.customName]);

  const foodById = useMemo(
    () => new Map(ALL_FOODS.map((food) => [food.id, food])),
    [],
  );
  const favoriteIdSet = useMemo(() => new Set(favoriteFoodIds), [favoriteFoodIds]);
  const selectedRows = useMemo(
    () => buildSelectedRows(selectionItems, previewMeal),
    [previewMeal, selectionItems],
  );
  const selectedFoodIds = useMemo(
    () => new Set(selectedRows.map((item) => item.foodId)),
    [selectedRows],
  );
  const recentFoodIds = useMemo(
    () => [
      ...recentFoodIdsByKind.protein,
      ...recentFoodIdsByKind.vegetable,
      ...recentFoodIdsByKind.fruit,
      ...recentFoodIdsByKind.condiment,
    ],
    [recentFoodIdsByKind],
  );
  const favoriteFoods = useMemo(
    () => getFoodsFromIds(favoriteFoodIds, foodById).slice(0, 8),
    [favoriteFoodIds, foodById],
  );
  const recentFoods = useMemo(
    () =>
      getFoodsFromIds(recentFoodIds, foodById)
        .filter((food) => !favoriteIdSet.has(food.id))
        .slice(0, 8),
    [favoriteIdSet, foodById, recentFoodIds],
  );
  const suggestedFoods = useMemo(
    () =>
      PROTEIN_FOODS.filter((food) => !favoriteIdSet.has(food.id))
        .slice(0, 10),
    [favoriteIdSet],
  );
  const recentMealChoices = useMemo(
    () => buildRecentMealChoices(allMeals, meal?.id),
    [allMeals, meal?.id],
  );
  const resultFoods = useMemo(() => {
    const hasQuery = query.trim().length > 0;
    const shouldShowFilteredList = hasQuery || activeFilter !== "all";

    if (!shouldShowFilteredList) {
      return [];
    }

    return ALL_FOODS.filter((food) => {
      if (activeFilter !== "all" && food.kind !== activeFilter) {
        return false;
      }

      return matchesFoodQuery(food, query);
    });
  }, [activeFilter, query]);
  const hasQuery = query.trim().length > 0;
  const showQuickRows = !hasQuery && activeFilter === "all";

  function selectFood(food: FoodItem) {
    handleSelectFood(food.kind, food.id);
  }

  function toggleFavorite(foodId: string) {
    void toggleFavoriteFood(foodId);
  }

  return (
    <>
      <BottomSheet
        footer={
          searchFocused ? undefined : (
          <View className="gap-3">
            <View className="flex-row items-end justify-between gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
                  Obrok
                </Text>
                <Text className="text-sm text-muted" numberOfLines={1}>
                  {previewMeal?.name ?? "Nije uneto"}
                </Text>
              </View>
              <View className="items-end gap-1">
                <Text
                  className="text-2xl font-black text-text"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {formatMacroGrams(previewMeal?.proteinG)} g
                </Text>
                <Text className="text-sm text-muted">
                  {formatKcal(previewMeal?.calories)} kcal
                </Text>
              </View>
            </View>

            <PrimaryButton
              disabled={!canSave}
              haptic="success"
              label={meal ? "Sacuvaj izmenu" : "Dodaj obrok"}
              loading={isSaving}
              onPress={() => {
                void handleSave();
              }}
            />

            <PrimaryButton
              haptic="none"
              label="Zatvori"
              onPress={() => onOpenChange(false)}
              variant="ghost"
            />
          </View>
          )
        }
        onOpenChange={onOpenChange}
        open={open}
        title={meal ? "Izmeni obrok" : "Dodaj obrok"}
      >
        <View className="gap-5">
          <FoodSearchPanel
            activeFilter={activeFilter}
            favoriteFoods={favoriteFoods}
            favoriteIdSet={favoriteIdSet}
            hasQuery={hasQuery}
            onSearchBlur={() => setSearchFocused(false)}
            onSearchFocus={() => setSearchFocused(true)}
            onSelectFood={selectFood}
            onSelectMeal={applyMealDraft}
            onSelectTemplate={applyMealDraft}
            onToggleFavorite={toggleFavorite}
            query={query}
            recentFoods={recentFoods}
            recentMealChoices={recentMealChoices}
            resultFoods={resultFoods}
            selectedFoodIds={selectedFoodIds}
            setActiveFilter={setActiveFilter}
            setQuery={setQuery}
            showQuickRows={showQuickRows}
            suggestedFoods={suggestedFoods}
            templateChoices={mealTemplates}
          >
            <SelectedFoodsSection
              items={selectedRows}
              onAdjustAmount={adjustSelectionAmount}
              onEditAmount={openAmountSheet}
              onRemove={handleRemoveSelection}
            />
          </FoodSearchPanel>

          <MealNameControl
            customName={customName}
            draftName={draftName}
            open={nameEditorOpen}
            setDraftName={setDraftName}
            setOpen={setNameEditorOpen}
          />

          <SupplementControl
            definitions={availableSupplementDefinitions}
            onToggle={toggleSupplement}
            open={supplementsOpen}
            setOpen={setSupplementsOpen}
            supplements={supplements}
          />
        </View>
      </BottomSheet>

      <FoodAmountSheet
        foodLabel={amountFood?.label ?? null}
        initialGrams={amountTarget?.initialGrams ?? null}
        kind={amountTarget?.kind ?? null}
        onOpenChange={(nextOpen) => !nextOpen && setAmountTarget(null)}
        onSave={handleSaveGrams}
        open={amountTarget !== null}
      />
    </>
  );
}
