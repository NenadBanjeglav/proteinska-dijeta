import { Pressable, Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { getBasisLabel } from "@/src/lib/meals";
import { cn } from "@/src/lib/cn";
import type { FoodItem } from "@/src/types/app";

type FoodChoiceCardProps = {
  food: FoodItem;
  selected: boolean;
  onPress: () => void;
};

function getPriorityCopy(food: FoodItem) {
  if (food.priority === "tierA") {
    return {
      badge: "Osnova",
      badgeWrapClassName: "bg-success/15",
      badgeTextClassName: "text-success",
      note: "Najbolji izbor za svakodnevni PSMF obrok.",
    };
  }

  if (food.priority === "tierB") {
    return {
      badge: "Dobra opcija",
      badgeWrapClassName: "bg-surface-soft",
      badgeTextClassName: "text-muted-strong",
      note: "Dobra zamena kada zelis malo vise raznovrsnosti.",
    };
  }

  if (food.priority === "limited") {
    return {
      badge: "Umereno",
      badgeWrapClassName: "bg-warning/15",
      badgeTextClassName: "text-warning",
      note: "Koristi redje i u manjim kolicinama.",
    };
  }

  return {
    badge: "Dodatak",
    badgeWrapClassName: "bg-accent/15",
    badgeTextClassName: "text-warning",
    note: "Za ukus, ne kao glavna baza obroka.",
  };
}

export function FoodChoiceCard({
  food,
  selected,
  onPress,
}: FoodChoiceCardProps) {
  const priority = getPriorityCopy(food);

  return (
    <Pressable onPress={onPress}>
      <Card
        className={cn(
          "gap-3 px-4 py-4",
          selected
            ? "border-warning bg-surface-strong"
            : food.priority === "limited"
              ? "border-warning/30 bg-surface"
              : undefined,
        )}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-base font-bold text-text">{food.label}</Text>
            <Text className="text-sm text-muted">
              {food.proteinPer100g} g proteina / {food.caloriesPer100g} kcal na 100 g
            </Text>
          </View>

          <View className="items-end gap-2">
            <View className={cn("rounded-full px-3 py-1", priority.badgeWrapClassName)}>
              <Text
                className={cn(
                  "text-xs font-semibold uppercase tracking-[1.2px]",
                  priority.badgeTextClassName,
                )}
              >
                {priority.badge}
              </Text>
            </View>
            <Text className="text-xs uppercase tracking-[1.2px] text-muted">
              {getBasisLabel(food.basis)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-sm leading-5 text-muted">{priority.note}</Text>
          <View
            className={cn(
              "h-5 w-5 rounded-full border-2",
              selected ? "border-warning bg-warning" : "border-border",
            )}
          />
        </View>
      </Card>
    </Pressable>
  );
}
