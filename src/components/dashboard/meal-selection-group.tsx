import { Text, View } from "react-native";

import { MealSelectionSummary } from "@/src/components/dashboard/meal-selection-summary";
import type { MealSelection } from "@/src/lib/meals";

type MealSelectionGroupProps = {
  title: string;
  items: (MealSelection & { label: string })[];
  onEditAmount: (foodId: string) => void;
  onAdjustAmount: (foodId: string, delta: number) => void;
  onRemove: (foodId: string) => void;
  stepSize: number;
};

export function MealSelectionGroup({
  title,
  items,
  onEditAmount,
  onAdjustAmount,
  onRemove,
  stepSize,
}: MealSelectionGroupProps) {
  if (!items.length) {
    return null;
  }

  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
        {title}
      </Text>
      {items.map((item) => (
        <MealSelectionSummary
          key={item.foodId}
          grams={item.grams}
          label={item.label}
          onDecreaseAmount={() => onAdjustAmount(item.foodId, -stepSize)}
          onClear={() => onRemove(item.foodId)}
          onEditAmount={() => onEditAmount(item.foodId)}
          onIncreaseAmount={() => onAdjustAmount(item.foodId, stepSize)}
          stepLabel={`${stepSize} g`}
        />
      ))}
    </View>
  );
}
