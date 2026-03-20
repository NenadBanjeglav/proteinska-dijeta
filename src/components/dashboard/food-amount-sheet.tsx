import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

import { ActionPill } from "@/src/components/dashboard/action-pill";
import { BottomSheet } from "@/src/components/ui/bottom-sheet";
import { Card } from "@/src/components/ui/card";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import type { FoodKind } from "@/src/types/app";

type FoodAmountSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: FoodKind | null;
  foodLabel: string | null;
  initialGrams: number | null;
  onSave: (grams: number) => void;
};

const MAX_GRAMS = 2000;

const CONFIG = {
  protein: {
    title: "Količina proteina",
    description: "Unesi grame direktno za ovaj proteinski izvor.",
    quickAmounts: [100, 150, 200],
    step: 25,
  },
  vegetable: {
    title: "Količina povrća",
    description: "Unesi grame direktno za ovo povrće.",
    quickAmounts: [100, 150, 250],
    step: 25,
  },
  condiment: {
    title: "Količina dodatka",
    description: "Unesi grame direktno za ovaj dozvoljeni dodatak.",
    quickAmounts: [5, 10, 20, 30],
    step: 5,
  },
} as const;

function normalizeGramsInput(value: string) {
  return value.replace(/[^0-9]/g, "").slice(0, 4);
}

function parseGramsInput(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed);
}

export function FoodAmountSheet({
  open,
  onOpenChange,
  kind,
  foodLabel,
  initialGrams,
  onSave,
}: FoodAmountSheetProps) {
  const [draftInput, setDraftInput] = useState(initialGrams ? String(initialGrams) : "");
  const parsedGrams = parseGramsInput(draftInput);
  const isOutOfRange = parsedGrams !== null && (parsedGrams <= 0 || parsedGrams > MAX_GRAMS);
  const canSave = parsedGrams !== null && !isOutOfRange;

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftInput(initialGrams ? String(initialGrams) : "");
  }, [initialGrams, open]);

  if (!kind || !foodLabel) {
    return null;
  }

  const config = CONFIG[kind];

  function setGrams(nextValue: number) {
    const safeValue = Math.max(1, Math.min(MAX_GRAMS, Math.round(nextValue)));
    setDraftInput(String(safeValue));
  }

  return (
    <BottomSheet
      onOpenChange={onOpenChange}
      open={open}
      title={`${config.title} • ${foodLabel}`}
    >
      <View className="gap-4">
        <Card className="gap-3 border-warning bg-surface-strong px-5 py-6">
          <Text className="text-center text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Količina u gramima
          </Text>
          <View className="flex-row items-end justify-center gap-3">
            <TextInput
              autoFocus
              className="min-w-[168px] border-b border-warning pb-2 text-center text-[42px] font-black text-text"
              inputMode="numeric"
              keyboardType="number-pad"
              onChangeText={(value) => setDraftInput(normalizeGramsInput(value))}
              placeholder="0"
              placeholderTextColor="#6F7A90"
              selectTextOnFocus
              value={draftInput}
            />
            <Text className="pb-3 text-lg font-bold text-muted-strong">g</Text>
          </View>
          <Text className="text-center text-sm leading-6 text-muted">
            {isOutOfRange
              ? `Unesi broj između 1 i ${MAX_GRAMS} g.`
              : config.description}
          </Text>
        </Card>

        <Card className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
            Brza promena
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <ActionPill
              disabled={parsedGrams === null}
              label={`-${config.step} g`}
              onPress={() => {
                if (parsedGrams === null) {
                  return;
                }

                setGrams(parsedGrams - config.step);
              }}
              variant="muted"
            />
            {config.quickAmounts.map((amount) => (
              <ActionPill
                key={amount}
                label={`${amount} g`}
                onPress={() => setGrams(amount)}
                variant={parsedGrams === amount ? "accent" : "muted"}
              />
            ))}
            <ActionPill
              disabled={parsedGrams === null}
              label={`+${config.step} g`}
              onPress={() => {
                if (parsedGrams === null) {
                  return;
                }

                setGrams(parsedGrams + config.step);
              }}
              variant="accent"
            />
          </View>
        </Card>

        <View className="gap-3 pt-1">
          <PrimaryButton
            disabled={!canSave}
            haptic="success"
            label="Sačuvaj količinu"
            onPress={() => {
              if (parsedGrams === null || isOutOfRange) {
                return;
              }

              onSave(parsedGrams);
              onOpenChange(false);
            }}
          />
          <PrimaryButton
            haptic="none"
            label="Odustani"
            onPress={() => onOpenChange(false)}
            variant="ghost"
          />
        </View>
      </View>
    </BottomSheet>
  );
}
