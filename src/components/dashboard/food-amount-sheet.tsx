import { Text, View } from "react-native";

import { ActionPill } from "@/src/components/dashboard/action-pill";
import { GramsStepper } from "@/src/components/dashboard/grams-stepper";
import { BottomSheet } from "@/src/components/ui/bottom-sheet";
import { Card } from "@/src/components/ui/card";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import type { FoodKind } from "@/src/types/app";

type FoodAmountSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: FoodKind | null;
  foodLabel: string | null;
  grams: number;
  onChange: (grams: number) => void;
};

const CONFIG = {
  protein: {
    title: "Kolicina proteina",
    description: "Podesi grame odmah da kasnije ne trazis kolicinu po ekranu.",
    min: 50,
    fineStep: 10,
    coarseStep: 50,
    quickValues: [100, 150, 200, 250],
  },
  vegetable: {
    title: "Kolicina povrca",
    description: "Povrce prilagodi obroku, a skrobnije opcije drzi umerenim.",
    min: 25,
    fineStep: 25,
    coarseStep: 100,
    quickValues: [100, 200, 300, 400],
  },
  condiment: {
    title: "Kolicina condimenta",
    description: "Dodaci su tu zbog ukusa, zato ih drzi u manjim kolicinama.",
    min: 5,
    fineStep: 5,
    coarseStep: 20,
    quickValues: [10, 20, 30, 40],
  },
} as const;

export function FoodAmountSheet({
  open,
  onOpenChange,
  kind,
  foodLabel,
  grams,
  onChange,
}: FoodAmountSheetProps) {
  if (!kind || !foodLabel) {
    return null;
  }

  const config = CONFIG[kind];

  return (
    <BottomSheet
      onOpenChange={onOpenChange}
      open={open}
      title={`${config.title} - ${foodLabel}`}
    >
      <View className="gap-4">
        <Card className="items-center gap-2 border-warning bg-surface-strong py-5">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Trenutno izabrano
          </Text>
          <Text
            className="text-[42px] font-black text-text"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {grams}g
          </Text>
          <Text className="text-center text-sm leading-6 text-muted">
            {config.description}
          </Text>
        </Card>

        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
            Brzi izbor
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {config.quickValues.map((value) => (
              <ActionPill
                key={value}
                label={`${value}g`}
                onPress={() => onChange(value)}
                variant={grams === value ? "accent" : "muted"}
              />
            ))}
          </View>
        </View>

        <GramsStepper
          coarseStep={config.coarseStep}
          fineStep={config.fineStep}
          label={config.title}
          min={config.min}
          onChange={onChange}
          value={grams}
        />

        <PrimaryButton label="Gotovo" onPress={() => onOpenChange(false)} />
      </View>
    </BottomSheet>
  );
}
