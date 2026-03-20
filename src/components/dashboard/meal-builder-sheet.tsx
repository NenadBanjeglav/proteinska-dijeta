import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { FoodAmountSheet } from "@/src/components/dashboard/food-amount-sheet";
import { MealBuilderSupplementsStep } from "@/src/components/dashboard/meal-builder-supplements-step";
import {
  MealFoodPicker,
  OptionalChoiceCard,
} from "@/src/components/dashboard/meal-food-picker";
import { MealSelectionGroup } from "@/src/components/dashboard/meal-selection-group";
import { BottomSheet } from "@/src/components/ui/bottom-sheet";
import { Card } from "@/src/components/ui/card";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { cn } from "@/src/lib/cn";
import { triggerHaptic } from "@/src/lib/haptics";
import {
  addMealSelection,
  buildLoggedMeal,
  createEmptyMealSupplements,
  findFoodItem,
  findMealSelection,
  getAvailableMealSupplementDefinitions,
  getFoodsByKind,
  getMealSupplements,
  getRecentFoodIdsByKind,
  getSelectionsFromMeal,
  normalizeMealName,
  removeMealSelection,
  updateMealSelectionGrams,
  type MealSelection,
} from "@/src/lib/meals";
import { usePsmfStore } from "@/src/store/psmf-store";
import type {
  FoodKind,
  LoggedMeal,
  MealSupplementKey,
  MealSupplements,
} from "@/src/types/app";

type MealAmountTarget = {
  kind: FoodKind;
  foodId: string;
  mode: "new" | "edit";
  initialGrams: number;
} | null;

type MealSectionKey = "protein" | "vegetable" | "condiment" | "supplements";

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
const CONDIMENT_FOODS = getFoodsByKind("condiment");

const DEFAULT_GRAMS: Record<FoodKind, number> = {
  protein: 150,
  vegetable: 150,
  condiment: 20,
};

const SECTION_OPTIONS: {
  key: MealSectionKey;
  label: string;
  title: string;
  description: string;
  iconSet: "ion" | "material";
  icon: string;
}[] = [
  {
    key: "protein",
    label: "Protein",
    title: "Protein",
    description: "Izaberi proteinske izvore i unesi grame direktno za svaki izbor.",
    iconSet: "material",
    icon: "food-steak",
  },
  {
    key: "vegetable",
    label: "Povrće",
    title: "Povrće",
    description: "Dodaj povrće po potrebi ili ostavi ovaj obrok bez povrća.",
    iconSet: "ion",
    icon: "leaf-outline",
  },
  {
    key: "condiment",
    label: "Dodaci",
    title: "Dodaci",
    description: "Dodaj manje začine i dodatke koji ostaju u okviru protokola.",
    iconSet: "material",
    icon: "soy-sauce",
  },
  {
    key: "supplements",
    label: "Suplementi",
    title: "Suplementi",
    description: "Označi šta ide uz ovaj obrok i šta je ostalo od dnevnih suplemenata.",
    iconSet: "material",
    icon: "pill-multiple",
  },
];

function buildSelectionItems(selections: MealSelection[]) {
  return selections
    .map((selection) => {
      const food = findFoodItem(selection.foodId);
      if (!food) {
        return null;
      }

      return {
        ...selection,
        label: food.label,
      };
    })
    .filter((item): item is MealSelection & { label: string } => item !== null);
}

function SectionCopy({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View className="gap-1">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
        {title}
      </Text>
      <Text className="text-sm leading-6 text-muted">{description}</Text>
    </View>
  );
}

function SectionTabs({
  value,
  onChange,
  counts,
}: {
  value: MealSectionKey;
  onChange: (value: MealSectionKey) => void;
  counts: Record<MealSectionKey, number>;
}) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
        Sekcije
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {SECTION_OPTIONS.map((option) => {
          const active = option.key === value;
          const iconColor = active ? "#0F172A" : "#CBD5E1";

          return (
            <Pressable
              key={option.key}
              accessibilityLabel={option.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={cn(
                "min-h-[56px] min-w-[56px] flex-row items-center justify-center gap-2 rounded-full border px-4 py-3",
                active
                  ? "border-accent bg-accent"
                  : "border-border bg-surface-soft",
              )}
              onPress={() => {
                triggerHaptic("selection");
                onChange(option.key);
              }}
            >
              {option.iconSet === "material" ? (
                <MaterialCommunityIcons
                  color={iconColor}
                  name={option.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={20}
                />
              ) : (
                <Ionicons
                  color={iconColor}
                  name={option.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                />
              )}
              <View
                className={cn(
                  "min-w-[22px] rounded-full px-2 py-0.5",
                  active ? "bg-black/15" : "bg-background/80",
                )}
              >
                <Text
                  className={cn(
                    "text-center text-xs font-black",
                    active ? "text-text" : "text-muted",
                  )}
                >
                  {counts[option.key]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

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
  const [proteins, setProteins] = useState<MealSelection[]>([]);
  const [vegetables, setVegetables] = useState<MealSelection[]>([]);
  const [condiments, setCondiments] = useState<MealSelection[]>([]);
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

    setProteins(getSelectionsFromMeal(meal, "protein"));
    setVegetables(getSelectionsFromMeal(meal, "vegetable"));
    setCondiments(getSelectionsFromMeal(meal, "condiment"));
    setSupplements(getMealSupplements(meal));
    setDraftName(meal?.customName ?? "");
    setActiveSection("protein");
    setIsSaving(false);
    setAmountTarget(null);
  }, [meal, open]);

  const previewMeal = useMemo(() => {
    if (!proteins.length) {
      return null;
    }

    return buildLoggedMeal({
      date,
      mealsForDate,
      proteins,
      vegetables,
      condiments,
      supplements,
      customName: draftName,
      existingMeal: meal,
    });
  }, [condiments, date, draftName, meal, mealsForDate, proteins, supplements, vegetables]);

  const proteinItems = useMemo(() => buildSelectionItems(proteins), [proteins]);
  const vegetableItems = useMemo(() => buildSelectionItems(vegetables), [vegetables]);
  const condimentItems = useMemo(() => buildSelectionItems(condiments), [condiments]);

  const sectionCounts = useMemo(
    () => ({
      protein: proteinItems.length,
      vegetable: vegetableItems.length,
      condiment: condimentItems.length,
      supplements: Object.values(supplements).filter(Boolean).length,
    }),
    [condimentItems.length, proteinItems.length, supplements, vegetableItems.length],
  );

  const activeSectionConfig = SECTION_OPTIONS.find((option) => option.key === activeSection)!;

  const availableSupplementDefinitions = useMemo(
    () => getAvailableMealSupplementDefinitions(mealsForDate, meal?.id, supplements),
    [meal?.id, mealsForDate, supplements],
  );
  const recentProteinIds = useMemo(
    () => getRecentFoodIdsByKind(allMeals, "protein"),
    [allMeals],
  );
  const recentVegetableIds = useMemo(
    () => getRecentFoodIdsByKind(allMeals, "vegetable"),
    [allMeals],
  );
  const recentCondimentIds = useMemo(
    () => getRecentFoodIdsByKind(allMeals, "condiment"),
    [allMeals],
  );

  function updateSelections(
    kind: FoodKind,
    updater: (current: MealSelection[]) => MealSelection[],
  ) {
    if (kind === "protein") {
      setProteins(updater);
      return;
    }

    if (kind === "vegetable") {
      setVegetables(updater);
      return;
    }

    setCondiments(updater);
  }

  function getSelections(kind: FoodKind) {
    if (kind === "protein") {
      return proteins;
    }

    if (kind === "vegetable") {
      return vegetables;
    }

    return condiments;
  }

  function openAmountSheet(kind: FoodKind, foodId: string, mode: "new" | "edit") {
    const existingSelection = findMealSelection(getSelections(kind), foodId);

    setAmountTarget({
      kind,
      foodId,
      mode,
      initialGrams: existingSelection?.grams ?? DEFAULT_GRAMS[kind],
    });
  }

  function handleSelectFood(kind: FoodKind, foodId: string) {
    const existingSelection = findMealSelection(getSelections(kind), foodId);

    if (!existingSelection) {
      updateSelections(kind, (current) =>
        addMealSelection(current, foodId, DEFAULT_GRAMS[kind]),
      );
      return;
    }

    openAmountSheet(kind, foodId, "edit");
  }

  function handleSaveGrams(grams: number) {
    if (!amountTarget) {
      return;
    }

    updateSelections(amountTarget.kind, (current) => {
      if (amountTarget.mode === "new") {
        return addMealSelection(current, amountTarget.foodId, grams);
      }

      return updateMealSelectionGrams(current, amountTarget.foodId, grams);
    });
    setAmountTarget(null);
  }

  function handleRemoveSelection(kind: FoodKind, foodId: string) {
    updateSelections(kind, (current) => removeMealSelection(current, foodId));

    if (amountTarget?.kind === kind && amountTarget.foodId === foodId) {
      setAmountTarget(null);
    }
  }

  function adjustSelectionAmount(kind: FoodKind, foodId: string, delta: number) {
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

  function renderActiveSection() {
    if (activeSection === "protein") {
      return (
        <View className="gap-4">
          <SectionCopy
            description={activeSectionConfig.description}
            title={activeSectionConfig.title}
          />
          <MealSelectionGroup
            items={proteinItems}
            onAdjustAmount={(foodId, delta) => adjustSelectionAmount("protein", foodId, delta)}
            onEditAmount={(foodId) => openAmountSheet("protein", foodId, "edit")}
            onRemove={(foodId) => handleRemoveSelection("protein", foodId)}
            stepSize={25}
            title="Izabrani proteini"
          />
          <MealFoodPicker
            defaultGrams={DEFAULT_GRAMS.protein}
            favoriteFoodIds={favoriteFoodIds}
            foods={PROTEIN_FOODS}
            onSelect={(foodId) => handleSelectFood("protein", foodId)}
            onToggleFavorite={(foodId) => {
              void toggleFavoriteFood(foodId);
            }}
            recentFoodIds={recentProteinIds}
            selectedFoodIds={proteins.map((selection) => selection.foodId)}
          />
        </View>
      );
    }

    if (activeSection === "vegetable") {
      return (
        <View className="gap-4">
          <SectionCopy
            description={activeSectionConfig.description}
            title={activeSectionConfig.title}
          />
          <OptionalChoiceCard
            label="Bez povrća u ovom obroku"
            onPress={() => setVegetables([])}
            selected={vegetables.length === 0}
          />
          <MealSelectionGroup
            items={vegetableItems}
            onAdjustAmount={(foodId, delta) => adjustSelectionAmount("vegetable", foodId, delta)}
            onEditAmount={(foodId) => openAmountSheet("vegetable", foodId, "edit")}
            onRemove={(foodId) => handleRemoveSelection("vegetable", foodId)}
            stepSize={25}
            title="Izabrano povrće"
          />
          <MealFoodPicker
            defaultGrams={DEFAULT_GRAMS.vegetable}
            favoriteFoodIds={favoriteFoodIds}
            foods={VEGETABLE_FOODS}
            onSelect={(foodId) => handleSelectFood("vegetable", foodId)}
            onToggleFavorite={(foodId) => {
              void toggleFavoriteFood(foodId);
            }}
            recentFoodIds={recentVegetableIds}
            selectedFoodIds={vegetables.map((selection) => selection.foodId)}
          />
        </View>
      );
    }

    if (activeSection === "supplements") {
      return (
        <View className="gap-4">
          <SectionCopy
            description={activeSectionConfig.description}
            title={activeSectionConfig.title}
          />
          <MealBuilderSupplementsStep
            availableKeys={availableSupplementDefinitions.map((definition) => definition.key)}
            onToggle={toggleSupplement}
            supplements={supplements}
          />
        </View>
      );
    }

    return (
      <View className="gap-4">
        <SectionCopy
          description={activeSectionConfig.description}
          title={activeSectionConfig.title}
        />
        <OptionalChoiceCard
          label="Bez dodataka u ovom obroku"
          onPress={() => setCondiments([])}
          selected={condiments.length === 0}
        />
        <MealSelectionGroup
          items={condimentItems}
          onAdjustAmount={(foodId, delta) => adjustSelectionAmount("condiment", foodId, delta)}
          onEditAmount={(foodId) => openAmountSheet("condiment", foodId, "edit")}
          onRemove={(foodId) => handleRemoveSelection("condiment", foodId)}
          stepSize={5}
          title="Izabrani dodaci"
        />
        <MealFoodPicker
          defaultGrams={DEFAULT_GRAMS.condiment}
          favoriteFoodIds={favoriteFoodIds}
          foods={CONDIMENT_FOODS}
          onSelect={(foodId) => handleSelectFood("condiment", foodId)}
          onToggleFavorite={(foodId) => {
            void toggleFavoriteFood(foodId);
          }}
          recentFoodIds={recentCondimentIds}
          selectedFoodIds={condiments.map((selection) => selection.foodId)}
        />
      </View>
    );
  }

  const amountFood = findFoodItem(amountTarget?.foodId ?? null);
  const canSave = !!previewMeal?.items.length;
  const customName = normalizeMealName(draftName);

  return (
    <>
      <BottomSheet
        footer={
          <View className="gap-3">
            <View className="flex-row items-end justify-between gap-3">
              <View className="gap-1">
                <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
                  Tekući zbir
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
                  {previewMeal?.calories ?? 0} kcal
                </Text>
              </View>
            </View>

            <PrimaryButton
              disabled={!canSave}
              haptic="success"
              label={meal ? "Sačuvaj izmenu" : "Dodaj obrok"}
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
              ? `Koristićemo naziv "${customName}".`
              : "Ako ostaviš prazno, naziv pravimo iz izabranih sastojaka."}
          </Text>
        </Card>

        <View className="-mx-6 mb-5 border-y border-border bg-surface px-6 py-3">
          <SectionTabs
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
