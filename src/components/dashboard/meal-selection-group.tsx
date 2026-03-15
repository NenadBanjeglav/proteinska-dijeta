import { Text, View } from "react-native";

import { MealSelectionSummary } from "@/src/components/dashboard/meal-selection-summary";
import type { MealSelection } from "@/src/lib/meals";

type MealSelectionGroupProps = {
  title: string;
  items: (MealSelection & { label: string })[];
  onEditAmount: (foodId: string) => void;
  onRemove: (foodId: string) => void;
};

export function MealSelectionGroup({
  title,
  items,
  onEditAmount,
  onRemove,
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
          onClear={() => onRemove(item.foodId)}
          onEditAmount={() => onEditAmount(item.foodId)}
        />
      ))}
    </View>
  );
}
