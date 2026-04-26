import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/cn";
import { triggerHaptic } from "@/src/lib/haptics";
import { formatKcal, formatMacroGrams } from "@/src/lib/units";
import type { FoodKind } from "@/src/types/app";

import {
  KIND_LABELS,
  KIND_TONES,
  type SelectedMealRow,
} from "@/src/components/dashboard/meal-logger/types";

function IconCircleButton({
  accessibilityLabel,
  disabled = false,
  icon,
  tone = "muted",
  onPress,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: "accent" | "danger" | "muted";
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={cn(
        "h-11 w-11 items-center justify-center rounded-2xl",
        tone === "accent" && "bg-accent",
        tone === "danger" && "bg-danger/15",
        tone === "muted" && "bg-surface-soft",
        disabled && "opacity-40",
      )}
      disabled={disabled}
      onPress={() => {
        triggerHaptic("selection");
        onPress();
      }}
    >
      <Ionicons
        color={tone === "danger" ? "#F04438" : tone === "accent" ? "#0F172A" : "#CBD5E1"}
        name={icon}
        size={19}
      />
    </Pressable>
  );
}

function SelectedFoodRow({
  item,
  stepSize,
  onDecrease,
  onEdit,
  onIncrease,
  onRemove,
}: {
  item: SelectedMealRow;
  stepSize: number;
  onDecrease: () => void;
  onEdit: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  return (
    <Card className="gap-3 border-warning/70 bg-surface-strong px-4 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-base font-bold text-text">{item.label}</Text>
          <Text className={cn("text-xs font-semibold uppercase", KIND_TONES[item.kind])}>
            {KIND_LABELS[item.kind]}
          </Text>
        </View>
        <View className="items-end gap-1">
          <Pressable
            accessibilityLabel="Izmeni kolicinu"
            accessibilityRole="button"
            className="rounded-2xl bg-background/70 px-3 py-2"
            onPress={() => {
              triggerHaptic("selection");
              onEdit();
            }}
          >
            <Text
              className="text-xl font-black text-text"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {item.grams} g
            </Text>
          </Pressable>
          <Text className="text-xs text-muted">
            {formatMacroGrams(item.proteinG)} g P / {formatKcal(item.calories)} kcal
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row gap-2">
          <IconCircleButton
            accessibilityLabel={`Smanji za ${stepSize} grama`}
            disabled={item.grams <= stepSize}
            icon="remove"
            onPress={onDecrease}
          />
          <IconCircleButton
            accessibilityLabel={`Povecaj za ${stepSize} grama`}
            icon="add"
            onPress={onIncrease}
            tone="accent"
          />
        </View>
        <View className="flex-row gap-2">
          <IconCircleButton
            accessibilityLabel="Tacna kolicina"
            icon="calculator-outline"
            onPress={onEdit}
          />
          <IconCircleButton
            accessibilityLabel="Ukloni namirnicu"
            icon="trash-outline"
            onPress={onRemove}
            tone="danger"
          />
        </View>
      </View>
    </Card>
  );
}

export function SelectedFoodsSection({
  items,
  onAdjustAmount,
  onEditAmount,
  onRemove,
}: {
  items: SelectedMealRow[];
  onAdjustAmount: (kind: FoodKind, foodId: string, delta: number) => void;
  onEditAmount: (kind: FoodKind, foodId: string) => void;
  onRemove: (kind: FoodKind, foodId: string) => void;
}) {
  if (!items.length) {
    return (
      <Card className="gap-2 border-dashed px-4 py-4">
        <Text className="text-base font-bold text-text">Izaberi namirnicu</Text>
        <Text className="text-sm text-muted">
          Najbrze je preko nedavnih, favorita ili pretrage.
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
        Izabrano
      </Text>
      {items.map((item) => {
        const stepSize = item.kind === "condiment" ? 5 : 25;

        return (
          <SelectedFoodRow
            item={item}
            key={`${item.kind}-${item.foodId}`}
            onDecrease={() => onAdjustAmount(item.kind, item.foodId, -stepSize)}
            onEdit={() => onEditAmount(item.kind, item.foodId)}
            onIncrease={() => onAdjustAmount(item.kind, item.foodId, stepSize)}
            onRemove={() => onRemove(item.kind, item.foodId)}
            stepSize={stepSize}
          />
        );
      })}
    </View>
  );
}
