import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/cn";
import { triggerHaptic } from "@/src/lib/haptics";
import { getBasisLabel } from "@/src/lib/meals";
import type { FoodItem } from "@/src/types/app";

type FoodChoiceCardProps = {
  food: FoodItem;
  selected: boolean;
  favorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export function FoodChoiceCard({
  food,
  selected,
  favorite,
  onPress,
  onToggleFavorite,
}: FoodChoiceCardProps) {
  return (
    <Pressable
      accessibilityHint="Dodaj namirnicu ili izmeni količinu ako je već izabrana."
      accessibilityLabel={`${food.label}, ${food.proteinPer100g} g proteina na 100 g`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="rounded-3xl"
      hitSlop={4}
      onPress={() => {
        triggerHaptic("selection");
        onPress();
      }}
    >
      <Card
        className={cn(
          "gap-3 px-4 py-4",
          selected && "border-warning bg-surface-strong",
        )}
      >
        <View className="gap-1">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 text-base font-bold text-text">{food.label}</Text>
            <View className="flex-row items-center gap-2">
              <Pressable
                accessibilityLabel={favorite ? "Ukloni iz favorita" : "Dodaj u favorite"}
                accessibilityRole="button"
                className="h-8 w-8 items-center justify-center rounded-full bg-surface-soft"
                hitSlop={6}
                onPress={(event) => {
                  event.stopPropagation();
                  triggerHaptic("selection");
                  onToggleFavorite();
                }}
              >
                <Ionicons
                  color={favorite ? "#FDB022" : "#6F7A90"}
                  name={favorite ? "star" : "star-outline"}
                  size={18}
                />
              </Pressable>
              <View
                className={cn(
                  "mt-0.5 h-5 w-5 rounded-full border-2",
                  selected ? "border-warning bg-warning" : "border-border",
                )}
              />
            </View>
          </View>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-sm text-muted">
              {food.proteinPer100g} g proteina / {food.caloriesPer100g} kcal na 100 g
            </Text>
            <Text className="text-xs uppercase tracking-[1.2px] text-muted">
              {getBasisLabel(food.basis)}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
