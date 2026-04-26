import { Pressable, Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { triggerHaptic } from "@/src/lib/haptics";
import { formatKcal, formatMacroGrams } from "@/src/lib/units";
import type { LoggedMeal, MealTemplate } from "@/src/types/app";

type MealChoice = LoggedMeal | MealTemplate;

export function RecentMealChoices<TMeal extends MealChoice>({
  meals,
  onSelect,
  title = "Nedavni obroci",
}: {
  meals: TMeal[];
  onSelect: (meal: TMeal) => void;
  title?: string;
}) {
  if (!meals.length) {
    return null;
  }

  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
        {title}
      </Text>
      <View className="gap-2">
        {meals.map((meal) => (
          <Pressable
            accessibilityLabel={`Upotrebi ${meal.name}`}
            accessibilityRole="button"
            className="rounded-3xl"
            key={meal.id}
            onPress={() => {
              triggerHaptic("selection");
              onSelect(meal);
            }}
          >
            <Card className="flex-row items-center justify-between gap-3 px-4 py-4">
              <View className="flex-1 gap-1">
                <Text className="text-base font-bold text-text" numberOfLines={1}>
                  {meal.name}
                </Text>
                <Text className="text-sm text-muted" numberOfLines={1}>
                  {meal.items.map((item) => item.label).join(", ")}
                </Text>
              </View>
              <View className="items-end gap-1">
                <Text className="text-lg font-black text-text">
                  {formatMacroGrams(meal.proteinG)} g
                </Text>
                <Text className="text-xs text-muted">{formatKcal(meal.calories)} kcal</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
