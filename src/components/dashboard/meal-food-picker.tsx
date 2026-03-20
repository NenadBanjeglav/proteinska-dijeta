import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { FoodChoiceCard } from "@/src/components/dashboard/food-choice-card";
import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/cn";
import { triggerHaptic } from "@/src/lib/haptics";
import type { FoodItem } from "@/src/types/app";

function normalizeSearchTerm(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filterFoodsByQuery(foods: FoodItem[], query: string) {
  const normalizedQuery = normalizeSearchTerm(query);

  if (!normalizedQuery) {
    return foods;
  }

  return foods.filter((food) =>
    normalizeSearchTerm(food.label).includes(normalizedQuery),
  );
}

function QuickFoodRow({
  title,
  icon,
  foods,
  onSelect,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  foods: FoodItem[];
  onSelect: (foodId: string) => void;
}) {
  if (!foods.length) {
    return null;
  }

  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {foods.map((food) => (
          <Pressable
            key={food.id}
            accessibilityLabel={food.label}
            accessibilityRole="button"
            className="min-h-[44px] rounded-full border border-border bg-surface-soft px-4 py-3"
            onPress={() => {
              triggerHaptic("selection");
              onSelect(food.id);
            }}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons color="#FDB022" name={icon} size={14} />
              <Text className="text-sm font-semibold text-text">{food.label}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function MealFoodPicker({
  foods,
  selectedFoodIds,
  defaultGrams,
  favoriteFoodIds,
  recentFoodIds,
  onSelect,
  onToggleFavorite,
}: {
  foods: FoodItem[];
  selectedFoodIds: string[];
  defaultGrams: number;
  favoriteFoodIds: string[];
  recentFoodIds: string[];
  onSelect: (foodId: string) => void;
  onToggleFavorite: (foodId: string) => void;
}) {
  const [query, setQuery] = useState("");

  const favoriteIdSet = useMemo(() => new Set(favoriteFoodIds), [favoriteFoodIds]);
  const recentIdSet = useMemo(() => new Set(recentFoodIds), [recentFoodIds]);
  const selectedIdSet = useMemo(() => new Set(selectedFoodIds), [selectedFoodIds]);
  const foodOrder = useMemo(
    () => new Map(foods.map((food, index) => [food.id, index])),
    [foods],
  );

  const filteredFoods = useMemo(
    () => filterFoodsByQuery(foods, query),
    [foods, query],
  );
  const orderedFoods = useMemo(
    () =>
      [...filteredFoods].sort((left, right) => {
        const leftRank = selectedIdSet.has(left.id)
          ? 0
          : favoriteIdSet.has(left.id)
            ? 1
            : recentIdSet.has(left.id)
              ? 2
              : 3;
        const rightRank = selectedIdSet.has(right.id)
          ? 0
          : favoriteIdSet.has(right.id)
            ? 1
            : recentIdSet.has(right.id)
              ? 2
              : 3;

        if (leftRank !== rightRank) {
          return leftRank - rightRank;
        }

        return (foodOrder.get(left.id) ?? 0) - (foodOrder.get(right.id) ?? 0);
      }),
    [favoriteIdSet, filteredFoods, foodOrder, recentIdSet, selectedIdSet],
  );
  const favoriteFoods = useMemo(
    () =>
      favoriteFoodIds
        .map((id) => foods.find((food) => food.id === id) ?? null)
        .filter((food): food is FoodItem => food !== null),
    [favoriteFoodIds, foods],
  );
  const recentFoods = useMemo(
    () =>
      recentFoodIds
        .filter((id) => !favoriteIdSet.has(id))
        .map((id) => foods.find((food) => food.id === id) ?? null)
        .filter((food): food is FoodItem => food !== null),
    [favoriteIdSet, foods, recentFoodIds],
  );
  const hasQuery = query.trim().length > 0;

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
            placeholder="Pretraži namirnice za ovaj korak"
            placeholderTextColor="#6F7A90"
            returnKeyType="search"
            value={query}
          />
        </Card>
        <Text className="text-xs leading-5 text-muted">
          Dodir dodaje {defaultGrams} g. Tačnu količinu menjaš iznad, na
          izabranoj stavci.
        </Text>
      </View>

      {!hasQuery ? (
        <>
          <QuickFoodRow
            foods={favoriteFoods}
            icon="star"
            onSelect={onSelect}
            title="Favoriti"
          />
          <QuickFoodRow
            foods={recentFoods}
            icon="time-outline"
            onSelect={onSelect}
            title="Nedavno"
          />
        </>
      ) : null}

      {orderedFoods.length ? (
        <View className="gap-3">
          {orderedFoods.map((food) => (
            <FoodChoiceCard
              favorite={favoriteIdSet.has(food.id)}
              key={food.id}
              food={food}
              onPress={() => onSelect(food.id)}
              onToggleFavorite={() => onToggleFavorite(food.id)}
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
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="rounded-3xl"
      onPress={() => {
        triggerHaptic("selection");
        onPress();
      }}
    >
      <Card className={cn("px-4 py-4", selected && "border-warning bg-surface-strong")}>
        <Text className="text-base font-semibold text-text">{label}</Text>
      </Card>
    </Pressable>
  );
}
