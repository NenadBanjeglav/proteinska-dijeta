import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { FoodAmountSheet } from "@/src/components/dashboard/food-amount-sheet";
import { MealFoodPicker, OptionalChoiceCard } from "@/src/components/dashboard/meal-food-picker";
import { MealSelectionGroup } from "@/src/components/dashboard/meal-selection-group";
import { MealBuilderSummaryStep } from "@/src/components/dashboard/meal-builder-summary-step";
import { BottomSheet } from "@/src/components/ui/bottom-sheet";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import {
  addMealSelection,
  buildLoggedMeal,
  findFoodItem,
  findMealSelection,
  getFoodsByKind,
  getSelectionsFromMeal,
  removeMealSelection,
  updateMealSelectionGrams,
  type MealSelection,
} from "@/src/lib/meals";
import type { FoodKind, LoggedMeal } from "@/src/types/app";

type MealBuilderStep = 1 | 2 | 3;

type MealAmountTarget = {
  kind: FoodKind;
  foodId: string;
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
    description: "Izaberi jedan ili vise proteinskih izvora i odmah podesi grame.",
  },
  2: {
    title: "2. Povrce i dodaci",
    description: "Dodaj povrce i, po zelji, manje dodatke za ukus.",
  },
  3: {
    title: "3. Suplementi i rezime",
    description: "Preleti dnevne suplemente i proveri ukupan protein i kalorije.",
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
      existingMeal: meal,
    });
  }, [condiments, date, meal, mealsForDate, proteins, vegetables]);

  const proteinItems = useMemo(() => buildSelectionItems(proteins), [proteins]);
  const vegetableItems = useMemo(() => buildSelectionItems(vegetables), [vegetables]);
  const condimentItems = useMemo(() => buildSelectionItems(condiments), [condiments]);

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

  function handleSelectFood(kind: FoodKind, foodId: string) {
    updateSelections(kind, (current) =>
      addMealSelection(current, foodId, DEFAULT_GRAMS[kind]),
    );
    setAmountTarget({ kind, foodId });
  }

  function handleChangeGrams(grams: number) {
    if (!amountTarget) {
      return;
    }

    updateSelections(amountTarget.kind, (current) =>
      updateMealSelectionGrams(current, amountTarget.foodId, grams),
    );
  }

  function handleRemoveSelection(kind: FoodKind, foodId: string) {
    updateSelections(kind, (current) => removeMealSelection(current, foodId));

    if (amountTarget?.kind === kind && amountTarget.foodId === foodId) {
      setAmountTarget(null);
    }
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

  const amountSelection = amountTarget
    ? findMealSelection(getSelections(amountTarget.kind), amountTarget.foodId)
    : null;
  const amountFood = findFoodItem(amountTarget?.foodId ?? null);

  return (
    <>
      <BottomSheet
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
            </View>
            <Text className="text-xl font-bold text-text">{STEP_COPY[step].title}</Text>
            <Text className="text-sm leading-6 text-muted">{STEP_COPY[step].description}</Text>
          </View>

          {step === 1 ? (
            <>
              <MealSelectionGroup
                items={proteinItems}
                onEditAmount={(foodId) => setAmountTarget({ kind: "protein", foodId })}
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
                onEditAmount={(foodId) => setAmountTarget({ kind: "vegetable", foodId })}
                onRemove={(foodId) => handleRemoveSelection("vegetable", foodId)}
                title="Izabrano povrce"
              />
              <MealFoodPicker
                foods={VEGETABLE_FOODS}
                onSelect={(foodId) => handleSelectFood("vegetable", foodId)}
                selectedFoodIds={vegetables.map((selection) => selection.foodId)}
              />

              <OptionalChoiceCard
                label="Bez dodataka u ovom obroku"
                onPress={() => setCondiments([])}
                selected={condiments.length === 0}
              />
              <MealSelectionGroup
                items={condimentItems}
                onEditAmount={(foodId) => setAmountTarget({ kind: "condiment", foodId })}
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

          {step === 3 ? <MealBuilderSummaryStep previewMeal={previewMeal} /> : null}

          <View className="gap-3 pt-1">
            {step === 1 ? (
              <PrimaryButton
                disabled={!proteins.length}
                label="Dalje na povrce i dodatke"
                onPress={() => setStep(2)}
              />
            ) : null}

            {step === 2 ? (
              <PrimaryButton label="Dalje na suplemente" onPress={() => setStep(3)} />
            ) : null}

            {step === 3 ? (
              <PrimaryButton
                disabled={!previewMeal || !previewMeal.items.length}
                label={meal ? "Sacuvaj izmenu" : "Dodaj obrok"}
                loading={isSaving}
                onPress={() => {
                  void handleSave();
                }}
              />
            ) : null}

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
        </View>
      </BottomSheet>

      <FoodAmountSheet
        foodLabel={amountFood?.label ?? null}
        grams={amountSelection?.grams ?? 0}
        kind={amountTarget?.kind ?? null}
        onChange={handleChangeGrams}
        onOpenChange={(nextOpen) => !nextOpen && setAmountTarget(null)}
        open={amountTarget !== null}
      />
    </>
  );
}
