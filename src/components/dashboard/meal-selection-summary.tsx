import { Text, View } from "react-native";

import { ActionPill } from "@/src/components/dashboard/action-pill";
import { Card } from "@/src/components/ui/card";

type MealSelectionSummaryProps = {
  title?: string;
  label: string;
  grams: number;
  onEditAmount: () => void;
  onClear?: () => void;
};

export function MealSelectionSummary({
  title,
  label,
  grams,
  onEditAmount,
  onClear,
}: MealSelectionSummaryProps) {
  return (
    <Card className="gap-3 border-warning bg-surface-strong px-4 py-4">
      {title ? (
        <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
          {title}
        </Text>
      ) : null}

      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-lg font-bold text-text">{label}</Text>
        <Text
          className="text-2xl font-black text-text"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {grams}g
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <ActionPill label="Promeni kolicinu" onPress={onEditAmount} variant="accent" />
        {onClear ? <ActionPill label="Ukloni" onPress={onClear} variant="muted" /> : null}
      </View>
    </Card>
  );
}
