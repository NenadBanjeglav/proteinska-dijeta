import { Text, TextInput, View } from "react-native";

import { FoodAmountSheet } from "@/src/components/dashboard/food-amount-sheet";
import {
  MEAL_SECTION_OPTIONS,
  MealBuilderFoodSection,
  MealBuilderSupplementsSection,
  MealSectionTabs,
} from "@/src/components/dashboard/meal-builder-sections";
import { BottomSheet } from "@/src/components/ui/bottom-sheet";
import { Card } from "@/src/components/ui/card";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import {
  DEFAULT_MEAL_GRAMS,
  useMealBuilder,
} from "@/src/hooks/use-meal-builder";
import { getFoodsByKind } from "@/src/lib/meals";
import { usePsmfStore } from "@/src/store/psmf-store";
import type { LoggedMeal } from "@/src/types/app";

type MealBuilderSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  mealsForDate: LoggedMeal[];
  meal?: LoggedMeal | null;
  onSave: (meal: LoggedMeal) => Promise<void>;
};

const PROTEIN_FOODS = getFoodsByKind("protein");
const VEGETABLE_FOODS = getFoodsByKind("vegetable");
const FRUIT_FOODS = getFoodsByKind("fruit");
const CONDIMENT_FOODS = getFoodsByKind("condiment");

export function MealBuilderSheet({
  open,
  onOpenChange,
  date,
  mealsForDate,
  meal = null,
  onSave,
}: MealBuilderSheetProps) {
  const allMeals = usePsmfStore((store) => store.data.meals);
  const favoriteFoodIds = usePsmfStore((store) => store.data.favoriteFoodIds);
  const toggleFavoriteFood = usePsmfStore((store) => store.toggleFavoriteFood);
  const {
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
  } = useMealBuilder({
    open,
    date,
    mealsForDate,
    meal,
    allMeals,
    onSave,
    onOpenChange,
  });

  const activeSectionConfig = MEAL_SECTION_OPTIONS.find(
    (option) => option.key === activeSection,
  )!;

  function handleToggleFavorite(foodId: string) {
    void toggleFavoriteFood(foodId);
  }

  function renderActiveSection() {
    if (activeSection === "protein") {
      return (
        <MealBuilderFoodSection
          defaultGrams={DEFAULT_MEAL_GRAMS.protein}
          description={activeSectionConfig.description}
          favoriteFoodIds={favoriteFoodIds}
          foods={PROTEIN_FOODS}
          onAdjustAmount={(foodId, delta) =>
            adjustSelectionAmount("protein", foodId, delta)
          }
          onEditAmount={(foodId) => openAmountSheet("protein", foodId)}
          onRemove={(foodId) => handleRemoveSelection("protein", foodId)}
          onSelect={(foodId) => handleSelectFood("protein", foodId)}
          onToggleFavorite={handleToggleFavorite}
          recentFoodIds={recentFoodIdsByKind.protein}
          selectedFoodIds={selections.protein.map((selection) => selection.foodId)}
          selectedTitle="Izabrani proteini"
          selectionItems={selectionItems.protein}
          stepSize={25}
          title={activeSectionConfig.title}
        />
      );
    }

    if (activeSection === "vegetable") {
      return (
        <MealBuilderFoodSection
          defaultGrams={DEFAULT_MEAL_GRAMS.vegetable}
          description={activeSectionConfig.description}
          favoriteFoodIds={favoriteFoodIds}
          foods={VEGETABLE_FOODS}
          onAdjustAmount={(foodId, delta) =>
            adjustSelectionAmount("vegetable", foodId, delta)
          }
          onEditAmount={(foodId) => openAmountSheet("vegetable", foodId)}
          onOptionalChoicePress={() => clearSelections("vegetable")}
          onRemove={(foodId) => handleRemoveSelection("vegetable", foodId)}
          onSelect={(foodId) => handleSelectFood("vegetable", foodId)}
          onToggleFavorite={handleToggleFavorite}
          optionalChoiceLabel="Bez povrca u ovom obroku"
          optionalChoiceSelected={selections.vegetable.length === 0}
          recentFoodIds={recentFoodIdsByKind.vegetable}
          selectedFoodIds={selections.vegetable.map((selection) => selection.foodId)}
          selectedTitle="Izabrano povrce"
          selectionItems={selectionItems.vegetable}
          stepSize={25}
          title={activeSectionConfig.title}
        />
      );
    }

    if (activeSection === "fruit") {
      return (
        <MealBuilderFoodSection
          defaultGrams={DEFAULT_MEAL_GRAMS.fruit}
          description={activeSectionConfig.description}
          favoriteFoodIds={favoriteFoodIds}
          foods={FRUIT_FOODS}
          onAdjustAmount={(foodId, delta) =>
            adjustSelectionAmount("fruit", foodId, delta)
          }
          onEditAmount={(foodId) => openAmountSheet("fruit", foodId)}
          onOptionalChoicePress={() => clearSelections("fruit")}
          onRemove={(foodId) => handleRemoveSelection("fruit", foodId)}
          onSelect={(foodId) => handleSelectFood("fruit", foodId)}
          onToggleFavorite={handleToggleFavorite}
          optionalChoiceLabel="Bez voca u ovom obroku"
          optionalChoiceSelected={selections.fruit.length === 0}
          recentFoodIds={recentFoodIdsByKind.fruit}
          selectedFoodIds={selections.fruit.map((selection) => selection.foodId)}
          selectedTitle="Izabrano voce"
          selectionItems={selectionItems.fruit}
          stepSize={25}
          title={activeSectionConfig.title}
        />
      );
    }

    if (activeSection === "supplements") {
      return (
        <MealBuilderSupplementsSection
          availableKeys={availableSupplementDefinitions.map(
            (definition) => definition.key,
          )}
          description={activeSectionConfig.description}
          onToggle={toggleSupplement}
          supplements={supplements}
          title={activeSectionConfig.title}
        />
      );
    }

    return (
      <MealBuilderFoodSection
        defaultGrams={DEFAULT_MEAL_GRAMS.condiment}
        description={activeSectionConfig.description}
        favoriteFoodIds={favoriteFoodIds}
        foods={CONDIMENT_FOODS}
        onAdjustAmount={(foodId, delta) =>
          adjustSelectionAmount("condiment", foodId, delta)
        }
        onEditAmount={(foodId) => openAmountSheet("condiment", foodId)}
        onOptionalChoicePress={() => clearSelections("condiment")}
        onRemove={(foodId) => handleRemoveSelection("condiment", foodId)}
        onSelect={(foodId) => handleSelectFood("condiment", foodId)}
        onToggleFavorite={handleToggleFavorite}
        optionalChoiceLabel="Bez dodataka u ovom obroku"
        optionalChoiceSelected={selections.condiment.length === 0}
        recentFoodIds={recentFoodIdsByKind.condiment}
        selectedFoodIds={selections.condiment.map((selection) => selection.foodId)}
        selectedTitle="Izabrani dodaci"
        selectionItems={selectionItems.condiment}
        stepSize={5}
        title={activeSectionConfig.title}
      />
    );
  }

  return (
    <>
      <BottomSheet
        footer={
          <View className="gap-3">
            <View className="flex-row items-end justify-between gap-3">
              <View className="gap-1">
                <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
                  Tekuci zbir
                </Text>
                <Text className="text-sm text-muted">
                  {previewMeal?.name ?? "Obrok u pripremi"}
                </Text>
              </View>
              <View className="items-end gap-1">
                <Text
                  className="text-2xl font-black text-text"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {previewMeal?.proteinG ?? 0} g
                </Text>
                <Text className="text-sm text-muted">
                  UH {previewMeal?.carbsG ?? 0} g / M {previewMeal?.fatG ?? 0} g /{" "}
                  {previewMeal?.calories ?? 0} kcal
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
        }
        onOpenChange={onOpenChange}
        open={open}
        stickyHeaderIndices={[1]}
        title={meal ? "Izmeni obrok" : "Dodaj obrok"}
      >
        <Card className="mb-5 gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
            Naziv obroka nije obavezan
          </Text>
          <TextInput
            className="rounded-3xl bg-surface-soft px-5 py-4 text-lg font-semibold text-text"
            onChangeText={setDraftName}
            placeholder="Ostavi prazno za automatski naziv"
            placeholderTextColor="#6F7A90"
            value={draftName}
          />
          <Text className="text-sm leading-6 text-muted">
            {customName
              ? `Koristicemo naziv "${customName}".`
              : "Ako ostavis prazno, naziv pravimo iz izabranih sastojaka."}
          </Text>
        </Card>

        <View className="-mx-6 mb-5 border-y border-border bg-surface px-6 py-3">
          <MealSectionTabs
            counts={sectionCounts}
            onChange={setActiveSection}
            value={activeSection}
          />
        </View>

        {renderActiveSection()}
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
