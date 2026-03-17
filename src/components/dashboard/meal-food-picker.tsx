import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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

function filterFoodsByQuery(foods: FoodItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return foods;
  }

  return foods.filter((food) => food.label.toLowerCase().includes(normalizedQuery));
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
  const [query, setQuery] = useState("");

  const filteredFoods = useMemo(
    () => filterFoodsByQuery(foods, query),
    [foods, query],
  );
  const hasQuery = query.trim().length > 0;

  const tierAFoods = foods.filter((food) => food.priority === "tierA");
  const tierBFoods = foods.filter((food) => food.priority === "tierB");
  const limitedFoods = foods.filter((food) => food.priority === "limited");
  const condimentFoods = foods.filter((food) => food.priority === "condiment");

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
          Lokalna pretraga
        </Text>
        <Card className="px-4 py-3">
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="text-base text-text"
            onChangeText={setQuery}
            placeholder="Pretrazi namirnice za ovaj korak"
            placeholderTextColor="#6F7A90"
            value={query}
          />
        </Card>
      </View>

      {hasQuery ? (
        filteredFoods.length ? (
          <View className="gap-3">
            {filteredFoods.map((food) => (
              <FoodChoiceCard
                key={food.id}
                food={food}
                onPress={() => onSelect(food.id)}
                selected={selectedFoodIds.includes(food.id)}
              />
            ))}
          </View>
        ) : (
          <Card className="px-4 py-4">
            <Text className="text-sm leading-6 text-muted">
              Nema poklapanja u lokalnom spisku za ovu pretragu.
            </Text>
          </Card>
        )
      ) : (
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
      )}
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
