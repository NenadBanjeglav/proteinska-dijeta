import { Pressable, Text, View } from "react-native";

import { FoodChoiceCard } from "@/src/components/dashboard/food-choice-card";
import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/cn";
import type { FoodItem } from "@/src/types/app";

function FoodSection({
  title,
  foods,
  selectedFoodIds,
  onSelect,
}: {
  title: string;
  foods: FoodItem[];
  selectedFoodIds: string[];
  onSelect: (foodId: string) => void;
}) {
  if (!foods.length) {
    return null;
  }

  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
        {title}
      </Text>
      {foods.map((food) => (
        <FoodChoiceCard
          key={food.id}
          food={food}
          onPress={() => onSelect(food.id)}
          selected={selectedFoodIds.includes(food.id)}
        />
      ))}
    </View>
  );
}

export function MealFoodPicker({
  foods,
  selectedFoodIds,
  onSelect,
}: {
  foods: FoodItem[];
  selectedFoodIds: string[];
  onSelect: (foodId: string) => void;
}) {
  const tierAFoods = foods.filter((food) => food.priority === "tierA");
  const tierBFoods = foods.filter((food) => food.priority === "tierB");
  const limitedFoods = foods.filter((food) => food.priority === "limited");
  const condimentFoods = foods.filter((food) => food.priority === "condiment");

  return (
    <View className="gap-4">
      <FoodSection
        foods={tierAFoods}
        onSelect={onSelect}
        selectedFoodIds={selectedFoodIds}
        title="Osnovni izbor"
      />
      <FoodSection
        foods={tierBFoods}
        onSelect={onSelect}
        selectedFoodIds={selectedFoodIds}
        title="Dobra alternativa"
      />
      <FoodSection
        foods={limitedFoods}
        onSelect={onSelect}
        selectedFoodIds={selectedFoodIds}
        title="Koristi umereno"
      />
      <FoodSection
        foods={condimentFoods}
        onSelect={onSelect}
        selectedFoodIds={selectedFoodIds}
        title="Dodaci"
      />
    </View>
  );
}

export function OptionalChoiceCard({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card className={cn("px-4 py-4", selected && "border-warning bg-surface-strong")}>
        <Text className="text-base font-semibold text-text">{label}</Text>
      </Card>
    </Pressable>
  );
}
