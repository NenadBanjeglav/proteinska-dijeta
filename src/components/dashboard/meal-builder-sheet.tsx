import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { FoodAmountSheet } from "@/src/components/dashboard/food-amount-sheet";
import { MealBuilderSupplementsStep } from "@/src/components/dashboard/meal-builder-supplements-step";
import { MealFoodPicker, OptionalChoiceCard } from "@/src/components/dashboard/meal-food-picker";
import { MealSelectionGroup } from "@/src/components/dashboard/meal-selection-group";
import { BottomSheet } from "@/src/components/ui/bottom-sheet";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import {
  addMealSelection,
  buildLoggedMeal,
  createEmptyMealSupplements,
  findFoodItem,
  findMealSelection,
  getAvailableMealSupplementDefinitions,
  getFoodsByKind,
  getMealSupplements,
  getSelectionsFromMeal,
  removeMealSelection,
  updateMealSelectionGrams,
  type MealSelection,
} from "@/src/lib/meals";
import type { FoodKind, LoggedMeal, MealSupplementKey, MealSupplements } from "@/src/types/app";

type MealBuilderStep = 1 | 2 | 3 | 4;

type MealAmountTarget = {
  kind: FoodKind;
  foodId: string;
  mode: "new" | "edit";
  initialGrams: number;
} | null;

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

const STEP_COPY: Record<MealBuilderStep, { title: string; description: string }> = {
  1: {
    title: "1. Protein",
    description: "Izaberi proteinske izvore i unesi grame direktno za svaki izbor.",
  },
  2: {
    title: "2. Povrce",
    description: "Dodaj povrce po potrebi ili ostavi ovaj obrok bez povrca.",
  },
  3: {
    title: "3. Dozvoljeni dodaci",
    description: "Dodaj manje zacine i dodatke koji ostaju u okviru protokola.",
  },
  4: {
    title: "4. Suplementi",
    description: "Oznaci sta ide uz ovaj obrok i sta je ostalo od dnevnih suplemenata.",
  },
};

function StepDot({ active }: { active: boolean }) {
  return <View className={`h-2.5 flex-1 rounded-full ${active ? "bg-accent" : "bg-surface-soft"}`} />;
}

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

function getPrimaryLabel(step: MealBuilderStep, isEditing: boolean) {
  if (step === 1) {
    return "Dalje na povrce";
  }

  if (step === 2) {
    return "Dalje na dodatke";
  }

  if (step === 3) {
    return "Dalje na suplemente";
  }

  return isEditing ? "Sacuvaj izmenu" : "Dodaj obrok";
}

export function MealBuilderSheet({
  open,
  onOpenChange,
  date,
  mealsForDate,
  meal = null,
  onSave,
}: MealBuilderSheetProps) {
  const [step, setStep] = useState<MealBuilderStep>(1);
  const [proteins, setProteins] = useState<MealSelection[]>([]);
  const [vegetables, setVegetables] = useState<MealSelection[]>([]);
  const [condiments, setCondiments] = useState<MealSelection[]>([]);
  const [supplements, setSupplements] = useState<MealSupplements>(
    createEmptyMealSupplements(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [amountTarget, setAmountTarget] = useState<MealAmountTarget>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep(1);
    setProteins(getSelectionsFromMeal(meal, "protein"));
    setVegetables(getSelectionsFromMeal(meal, "vegetable"));
    setCondiments(getSelectionsFromMeal(meal, "condiment"));
    setSupplements(getMealSupplements(meal));
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
      existingMeal: meal,
    });
  }, [condiments, date, meal, mealsForDate, proteins, supplements, vegetables]);

  const proteinItems = useMemo(() => buildSelectionItems(proteins), [proteins]);
  const vegetableItems = useMemo(() => buildSelectionItems(vegetables), [vegetables]);
  const condimentItems = useMemo(() => buildSelectionItems(condiments), [condiments]);

  const availableSupplementDefinitions = useMemo(
    () =>
      getAvailableMealSupplementDefinitions(mealsForDate, meal?.id, supplements),
    [meal?.id, mealsForDate, supplements],
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
    const mode = findMealSelection(getSelections(kind), foodId) ? "edit" : "new";
    openAmountSheet(kind, foodId, mode);
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

  function handlePrimaryAction() {
    if (step === 4) {
      void handleSave();
      return;
    }

    setStep((current) => Math.min(4, current + 1) as MealBuilderStep);
  }

  const amountFood = findFoodItem(amountTarget?.foodId ?? null);
  const canContinue =
    step === 1 ? proteins.length > 0 : step === 4 ? !!previewMeal?.items.length : true;

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
                  {previewMeal?.proteinG ?? 0}g
                </Text>
                <Text className="text-sm text-muted">
                  {previewMeal?.calories ?? 0} kcal
                </Text>
              </View>
            </View>

            <PrimaryButton
              disabled={!canContinue}
              label={getPrimaryLabel(step, !!meal)}
              loading={step === 4 && isSaving}
              onPress={handlePrimaryAction}
            />

            <PrimaryButton
              label={step === 1 ? "Zatvori" : "Nazad"}
              onPress={() => {
                if (step === 1) {
                  onOpenChange(false);
                  return;
                }

                setStep((current) => Math.max(1, current - 1) as MealBuilderStep);
              }}
              variant="ghost"
            />
          </View>
        }
        onOpenChange={onOpenChange}
        open={open}
        title={meal ? "Izmeni obrok" : "Dodaj obrok"}
      >
        <View className="gap-4">
          <View className="gap-3">
            <View className="flex-row gap-2">
              <StepDot active={step >= 1} />
              <StepDot active={step >= 2} />
              <StepDot active={step >= 3} />
              <StepDot active={step >= 4} />
            </View>
            <Text className="text-xl font-bold text-text">{STEP_COPY[step].title}</Text>
            <Text className="text-sm leading-6 text-muted">{STEP_COPY[step].description}</Text>
          </View>

          {step === 1 ? (
            <>
              <MealSelectionGroup
                items={proteinItems}
                onEditAmount={(foodId) => openAmountSheet("protein", foodId, "edit")}
                onRemove={(foodId) => handleRemoveSelection("protein", foodId)}
                title="Izabrani proteini"
              />
              <MealFoodPicker
                foods={PROTEIN_FOODS}
                onSelect={(foodId) => handleSelectFood("protein", foodId)}
                selectedFoodIds={proteins.map((selection) => selection.foodId)}
              />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <OptionalChoiceCard
                label="Bez povrca u ovom obroku"
                onPress={() => setVegetables([])}
                selected={vegetables.length === 0}
              />
              <MealSelectionGroup
                items={vegetableItems}
                onEditAmount={(foodId) => openAmountSheet("vegetable", foodId, "edit")}
                onRemove={(foodId) => handleRemoveSelection("vegetable", foodId)}
                title="Izabrano povrce"
              />
              <MealFoodPicker
                foods={VEGETABLE_FOODS}
                onSelect={(foodId) => handleSelectFood("vegetable", foodId)}
                selectedFoodIds={vegetables.map((selection) => selection.foodId)}
              />
            </>
          ) : null}

          {step === 3 ? (
            <>
              <OptionalChoiceCard
                label="Bez dodataka u ovom obroku"
                onPress={() => setCondiments([])}
                selected={condiments.length === 0}
              />
              <MealSelectionGroup
                items={condimentItems}
                onEditAmount={(foodId) => openAmountSheet("condiment", foodId, "edit")}
                onRemove={(foodId) => handleRemoveSelection("condiment", foodId)}
                title="Izabrani dodaci"
              />
              <MealFoodPicker
                foods={CONDIMENT_FOODS}
                onSelect={(foodId) => handleSelectFood("condiment", foodId)}
                selectedFoodIds={condiments.map((selection) => selection.foodId)}
              />
            </>
          ) : null}

          {step === 4 ? (
            <MealBuilderSupplementsStep
              availableKeys={availableSupplementDefinitions.map((definition) => definition.key)}
              onToggle={toggleSupplement}
              supplements={supplements}
            />
          ) : null}
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
