import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/cn";
import { triggerHaptic } from "@/src/lib/haptics";
import { getBasisLabel } from "@/src/lib/meals";
import { formatKcal, formatMacroGrams } from "@/src/lib/units";
import type { FoodItem, LoggedMeal, MealTemplate } from "@/src/types/app";

import { RecentMealChoices } from "@/src/components/dashboard/meal-logger/recent-meal-choices";
import {
  FOOD_FILTERS,
  KIND_LABELS,
  KIND_TONES,
  type FoodFilterKey,
} from "@/src/components/dashboard/meal-logger/types";

function FilterPill({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={cn(
        "min-h-[44px] rounded-2xl border px-4 py-2.5",
        active ? "border-accent bg-accent" : "border-border bg-surface-soft",
      )}
      onPress={() => {
        triggerHaptic("selection");
        onPress();
      }}
    >
      <Text
        className={cn(
          "text-sm font-bold",
          active ? "text-text" : "text-muted-strong",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FoodChip({
  food,
  selected,
  onPress,
}: {
  food: FoodItem;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={food.label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        "min-h-[44px] rounded-2xl border px-4 py-3",
        selected ? "border-warning bg-surface-strong" : "border-border bg-surface-soft",
      )}
      onPress={() => {
        triggerHaptic("selection");
        onPress();
      }}
    >
      <View className="flex-row items-center gap-2">
        <Ionicons
          color={selected ? "#FDB022" : "#CBD5E1"}
          name={selected ? "checkmark-circle" : "add-circle-outline"}
          size={16}
        />
        <Text className="text-sm font-semibold text-text">{food.label}</Text>
      </View>
    </Pressable>
  );
}

function QuickFoodRow({
  title,
  foods,
  selectedFoodIds,
  onSelect,
}: {
  title: string;
  foods: FoodItem[];
  selectedFoodIds: Set<string>;
  onSelect: (food: FoodItem) => void;
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
          <FoodChip
            food={food}
            key={food.id}
            onPress={() => onSelect(food)}
            selected={selectedFoodIds.has(food.id)}
          />
        ))}
      </View>
    </View>
  );
}

function FoodResultRow({
  favorite,
  food,
  selected,
  onPress,
  onToggleFavorite,
}: {
  favorite: boolean;
  food: FoodItem;
  selected: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${food.label}, ${formatMacroGrams(
        food.proteinPer100g,
      )} g proteina na 100 g`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="rounded-3xl"
      onPress={() => {
        triggerHaptic("selection");
        onPress();
      }}
    >
      <Card
        className={cn(
          "gap-2 px-4 py-4",
          selected && "border-warning bg-surface-strong",
        )}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-base font-bold text-text">{food.label}</Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className={cn("text-xs font-semibold uppercase", KIND_TONES[food.kind])}>
                {KIND_LABELS[food.kind]}
              </Text>
              <Text className="text-xs uppercase text-muted">
                {getBasisLabel(food.basis)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityLabel={favorite ? "Ukloni iz favorita" : "Dodaj u favorite"}
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-2xl bg-surface-soft"
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
            <Ionicons
              color={selected ? "#FDB022" : "#CBD5E1"}
              name={selected ? "checkmark-circle" : "add-circle-outline"}
              size={22}
            />
          </View>
        </View>

        <Text className="text-sm text-muted">
          {formatMacroGrams(food.proteinPer100g)} g P /{" "}
          {formatKcal(food.caloriesPer100g)} kcal na 100 g
        </Text>
      </Card>
    </Pressable>
  );
}

type FoodSearchControlsProps = {
  activeFilter: FoodFilterKey;
  query: string;
  setActiveFilter: (filter: FoodFilterKey) => void;
  setQuery: (query: string) => void;
  onSearchBlur?: () => void;
  onSearchFocus?: () => void;
};

type FoodSearchResultsProps = {
  favoriteFoods: FoodItem[];
  favoriteIdSet: Set<string>;
  hasQuery: boolean;
  recentFoods: FoodItem[];
  recentMealChoices: LoggedMeal[];
  resultFoods: FoodItem[];
  selectedFoodIds: Set<string>;
  showQuickRows: boolean;
  suggestedFoods: FoodItem[];
  templateChoices: MealTemplate[];
  onSelectFood: (food: FoodItem) => void;
  onSelectMeal: (meal: LoggedMeal) => void;
  onSelectTemplate: (template: MealTemplate) => void;
  onToggleFavorite: (foodId: string) => void;
};

export function FoodSearchControls({
  activeFilter,
  query,
  setActiveFilter,
  setQuery,
  onSearchBlur,
  onSearchFocus,
}: FoodSearchControlsProps) {
  return (
    <Card className="gap-3 px-4 py-4">
      <View className="flex-row items-center gap-3 rounded-2xl bg-surface-soft px-4 py-3">
        <Ionicons color="#6F7A90" name="search" size={18} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          className="min-h-[36px] flex-1 text-base text-text"
          onBlur={onSearchBlur}
          onChangeText={setQuery}
          onFocus={onSearchFocus}
          placeholder="Pretrazi hranu"
          placeholderTextColor="#6F7A90"
          returnKeyType="search"
          value={query}
        />
        {query ? (
          <Pressable
            accessibilityLabel="Ocisti pretragu"
            accessibilityRole="button"
            className="h-8 w-8 items-center justify-center rounded-xl bg-background/70"
            onPress={() => {
              triggerHaptic("selection");
              setQuery("");
            }}
          >
            <Ionicons color="#CBD5E1" name="close" size={17} />
          </Pressable>
        ) : null}
      </View>

      <View className="flex-row flex-wrap gap-2">
        {FOOD_FILTERS.map((filter) => (
          <FilterPill
            active={activeFilter === filter.key}
            key={filter.key}
            label={filter.label}
            onPress={() => setActiveFilter(filter.key)}
          />
        ))}
      </View>
    </Card>
  );
}

export function FoodSearchResults({
  favoriteFoods,
  favoriteIdSet,
  hasQuery,
  recentFoods,
  recentMealChoices,
  resultFoods,
  selectedFoodIds,
  showQuickRows,
  suggestedFoods,
  templateChoices,
  onSelectFood,
  onSelectMeal,
  onSelectTemplate,
  onToggleFavorite,
}: FoodSearchResultsProps) {
  return (
    <>

      {showQuickRows ? (
        <View className="gap-4">
          <RecentMealChoices
            meals={templateChoices}
            onSelect={onSelectTemplate}
            title="Omiljeni obroci"
          />
          <RecentMealChoices meals={recentMealChoices} onSelect={onSelectMeal} />
          <QuickFoodRow
            foods={favoriteFoods}
            onSelect={onSelectFood}
            selectedFoodIds={selectedFoodIds}
            title="Favoriti"
          />
          <QuickFoodRow
            foods={recentFoods}
            onSelect={onSelectFood}
            selectedFoodIds={selectedFoodIds}
            title="Nedavno"
          />
          <QuickFoodRow
            foods={suggestedFoods}
            onSelect={onSelectFood}
            selectedFoodIds={selectedFoodIds}
            title="Predlozi"
          />
        </View>
      ) : (
        <View className="gap-3">
          {resultFoods.length ? (
            resultFoods.map((food) => (
              <FoodResultRow
                favorite={favoriteIdSet.has(food.id)}
                food={food}
                key={food.id}
                onPress={() => onSelectFood(food)}
                onToggleFavorite={() => onToggleFavorite(food.id)}
                selected={selectedFoodIds.has(food.id)}
              />
            ))
          ) : (
            <Card className="px-4 py-4">
              <Text className="text-sm leading-6 text-muted">
                {hasQuery ? "Nema rezultata za ovu pretragu." : "Nema hrane u ovom filteru."}
              </Text>
            </Card>
          )}
        </View>
      )}
    </>
  );
}

export function FoodSearchPanel({
  activeFilter,
  children,
  favoriteFoods,
  favoriteIdSet,
  hasQuery,
  query,
  recentFoods,
  recentMealChoices,
  resultFoods,
  selectedFoodIds,
  setActiveFilter,
  setQuery,
  showQuickRows,
  suggestedFoods,
  templateChoices,
  onSearchBlur,
  onSearchFocus,
  onSelectFood,
  onSelectMeal,
  onSelectTemplate,
  onToggleFavorite,
}: FoodSearchControlsProps &
  FoodSearchResultsProps & {
    children?: ReactNode;
  }) {
  return (
    <>
      <FoodSearchControls
        activeFilter={activeFilter}
        onSearchBlur={onSearchBlur}
        onSearchFocus={onSearchFocus}
        query={query}
        setActiveFilter={setActiveFilter}
        setQuery={setQuery}
      />

      {children}

      <FoodSearchResults
        favoriteFoods={favoriteFoods}
        favoriteIdSet={favoriteIdSet}
        hasQuery={hasQuery}
        onSelectFood={onSelectFood}
        onSelectMeal={onSelectMeal}
        onSelectTemplate={onSelectTemplate}
        onToggleFavorite={onToggleFavorite}
        recentFoods={recentFoods}
        recentMealChoices={recentMealChoices}
        resultFoods={resultFoods}
        selectedFoodIds={selectedFoodIds}
        showQuickRows={showQuickRows}
        suggestedFoods={suggestedFoods}
        templateChoices={templateChoices}
      />
    </>
  );
}
