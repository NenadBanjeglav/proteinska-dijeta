import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FoodAmountSheet } from "@/src/components/dashboard/food-amount-sheet";
import {
  FoodSearchControls,
  FoodSearchResults,
} from "@/src/components/dashboard/meal-logger/food-search-panel";
import { MealNameControl } from "@/src/components/dashboard/meal-logger/meal-name-control";
import { SelectedFoodsSection } from "@/src/components/dashboard/meal-logger/selected-foods-section";
import { SupplementControl } from "@/src/components/dashboard/meal-logger/supplement-control";
import type { FoodFilterKey } from "@/src/components/dashboard/meal-logger/types";
import {
  ALL_FOODS,
  PROTEIN_FOODS,
  buildRecentMealChoices,
  buildSelectedRows,
  getFoodsFromIds,
  matchesFoodQuery,
} from "@/src/components/dashboard/meal-logger/utils";
import { Card } from "@/src/components/ui/card";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { useMealBuilder } from "@/src/hooks/use-meal-builder";
import { useToday } from "@/src/hooks/use-today";
import { formatKcal, formatMacroGrams } from "@/src/lib/units";
import { usePsmfStore } from "@/src/store/psmf-store";
import { selectIsOnboarded, selectMealsByDate } from "@/src/store/selectors";
import type { FoodItem } from "@/src/types/app";

function AddMealSession() {
  const data = usePsmfStore((store) => store.data);
  const saveMeal = usePsmfStore((store) => store.saveMeal);
  const toggleFavoriteFood = usePsmfStore((store) => store.toggleFavoriteFood);
  const { today } = useToday();
  const [builderOpen, setBuilderOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FoodFilterKey>("all");
  const [nameEditorOpen, setNameEditorOpen] = useState(false);
  const [supplementsOpen, setSupplementsOpen] = useState(false);

  const mealsForDate = useMemo(() => selectMealsByDate(data, today), [data, today]);
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
    applyMealDraft,
    handleRemoveSelection,
    handleSave,
    handleSaveGrams,
    handleSelectFood,
    openAmountSheet,
    toggleSupplement,
  } = useMealBuilder({
    open: builderOpen,
    date: today,
    mealsForDate,
    meal: null,
    template: null,
    allMeals: data.meals,
    foodGramsById: data.foodGramsById,
    onSave: saveMeal,
    onOpenChange: (nextOpen) => {
      setBuilderOpen(nextOpen);
      if (!nextOpen) {
        router.replace("/home");
      }
    },
  });

  const foodById = useMemo(
    () => new Map(ALL_FOODS.map((food) => [food.id, food])),
    [],
  );
  const favoriteIdSet = useMemo(
    () => new Set(data.favoriteFoodIds),
    [data.favoriteFoodIds],
  );
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
    () => getFoodsFromIds(data.favoriteFoodIds, foodById).slice(0, 8),
    [data.favoriteFoodIds, foodById],
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
      PROTEIN_FOODS.filter((food) => !favoriteIdSet.has(food.id)).slice(0, 10),
    [favoriteIdSet],
  );
  const recentMealChoices = useMemo(
    () => buildRecentMealChoices(data.meals),
    [data.meals],
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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="gap-3 border-b border-border bg-background px-6 pb-4 pt-4">
        <View className="gap-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Novi obrok
          </Text>
          <Text className="text-2xl font-black text-text">Dodaj hranu</Text>
        </View>
        <FoodSearchControls
          activeFilter={activeFilter}
          query={query}
          setActiveFilter={setActiveFilter}
          setQuery={setQuery}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ gap: 20, padding: 24, paddingBottom: 36 }}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="handled"
        >
          <SelectedFoodsSection
            items={selectedRows}
            onAdjustAmount={adjustSelectionAmount}
            onEditAmount={openAmountSheet}
            onRemove={handleRemoveSelection}
          />

          <FoodSearchResults
            favoriteFoods={favoriteFoods}
            favoriteIdSet={favoriteIdSet}
            hasQuery={hasQuery}
            onSelectFood={selectFood}
            onSelectMeal={applyMealDraft}
            onSelectTemplate={applyMealDraft}
            onToggleFavorite={toggleFavorite}
            recentFoods={recentFoods}
            recentMealChoices={recentMealChoices}
            resultFoods={resultFoods}
            selectedFoodIds={selectedFoodIds}
            showQuickRows={showQuickRows}
            suggestedFoods={suggestedFoods}
            templateChoices={data.mealTemplates}
          />

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

          <Card className="gap-4">
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
              label="Dodaj obrok"
              loading={isSaving}
              onPress={() => {
                void handleSave();
              }}
            />
            <PrimaryButton
              haptic="none"
              label="Odustani"
              onPress={() => router.replace("/home")}
              variant="ghost"
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <FoodAmountSheet
        foodLabel={amountFood?.label ?? null}
        initialGrams={amountTarget?.initialGrams ?? null}
        kind={amountTarget?.kind ?? null}
        onOpenChange={(nextOpen) => !nextOpen && setAmountTarget(null)}
        onSave={handleSaveGrams}
        open={amountTarget !== null}
      />
    </SafeAreaView>
  );
}

export function AddMealScreen() {
  const data = usePsmfStore((store) => store.data);
  const onboarded = selectIsOnboarded(data);
  const [sessionKey, setSessionKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setSessionKey((current) => current + 1);
    }, []),
  );

  if (!onboarded) {
    return (
      <SafeAreaView className="flex-1 bg-background px-6 py-6" edges={["top"]}>
        <Card className="gap-4">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Novi obrok
          </Text>
          <Text className="text-2xl font-black text-text">Zavrsi onboarding</Text>
          <Text className="text-sm leading-6 text-muted">
            Prvo zavrsi osnovna podesavanja da bismo znali dnevni cilj proteina.
          </Text>
          <PrimaryButton
            label="Idi na onboarding"
            onPress={() => router.replace("/onboarding/welcome")}
          />
        </Card>
      </SafeAreaView>
    );
  }

  return <AddMealSession key={sessionKey} />;
}
