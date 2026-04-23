import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { MealBuilderSupplementsStep } from "@/src/components/dashboard/meal-builder-supplements-step";
import {
  MealFoodPicker,
  OptionalChoiceCard,
} from "@/src/components/dashboard/meal-food-picker";
import { MealSelectionGroup } from "@/src/components/dashboard/meal-selection-group";
import { cn } from "@/src/lib/cn";
import { triggerHaptic } from "@/src/lib/haptics";
import type {
  MealSectionKey,
  MealSelectionItem,
} from "@/src/hooks/use-meal-builder";
import type {
  FoodItem,
  MealSupplementKey,
  MealSupplements,
} from "@/src/types/app";

type SectionCounts = Record<MealSectionKey, number>;

type FoodSectionProps = {
  title: string;
  description: string;
  foods: FoodItem[];
  selectedFoodIds: string[];
  selectionItems: MealSelectionItem[];
  favoriteFoodIds: string[];
  recentFoodIds: string[];
  defaultGrams: number;
  selectedTitle: string;
  stepSize: number;
  onSelect: (foodId: string) => void;
  onToggleFavorite: (foodId: string) => void;
  onAdjustAmount: (foodId: string, delta: number) => void;
  onEditAmount: (foodId: string) => void;
  onRemove: (foodId: string) => void;
  optionalChoiceLabel?: string;
  optionalChoiceSelected?: boolean;
  onOptionalChoicePress?: () => void;
};

type SupplementsSectionProps = {
  title: string;
  description: string;
  supplements: MealSupplements;
  availableKeys: MealSupplementKey[];
  onToggle: (key: MealSupplementKey) => void;
};

export const MEAL_SECTION_OPTIONS: {
  key: MealSectionKey;
  label: string;
  title: string;
  description: string;
  iconSet: "ion" | "material";
  icon: string;
}[] = [
  {
    key: "protein",
    label: "Protein",
    title: "Protein",
    description: "Izaberi proteinske izvore i unesi grame direktno za svaki izbor.",
    iconSet: "material",
    icon: "food-steak",
  },
  {
    key: "vegetable",
    label: "Povrce",
    title: "Povrce",
    description: "Dodaj povrce po potrebi ili ostavi ovaj obrok bez povrca.",
    iconSet: "ion",
    icon: "leaf-outline",
  },
  {
    key: "condiment",
    label: "Dodaci",
    title: "Dodaci",
    description: "Dodaj manje zacine i dodatke koji ostaju u okviru protokola.",
    iconSet: "material",
    icon: "soy-sauce",
  },
  {
    key: "supplements",
    label: "Suplementi",
    title: "Suplementi",
    description: "Oznaci sta ide uz ovaj obrok i sta je ostalo od dnevnih suplemenata.",
    iconSet: "material",
    icon: "pill-multiple",
  },
];

function SectionCopy({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View className="gap-1">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
        {title}
      </Text>
      <Text className="text-sm leading-6 text-muted">{description}</Text>
    </View>
  );
}

export function MealSectionTabs({
  value,
  onChange,
  counts,
}: {
  value: MealSectionKey;
  onChange: (value: MealSectionKey) => void;
  counts: SectionCounts;
}) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
        Sekcije
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {MEAL_SECTION_OPTIONS.map((option) => {
          const active = option.key === value;
          const iconColor = active ? "#0F172A" : "#CBD5E1";

          return (
            <Pressable
              key={option.key}
              accessibilityLabel={option.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={cn(
                "min-h-[56px] min-w-[56px] flex-row items-center justify-center gap-2 rounded-full border px-4 py-3",
                active ? "border-accent bg-accent" : "border-border bg-surface-soft",
              )}
              onPress={() => {
                triggerHaptic("selection");
                onChange(option.key);
              }}
            >
              {option.iconSet === "material" ? (
                <MaterialCommunityIcons
                  color={iconColor}
                  name={option.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={20}
                />
              ) : (
                <Ionicons
                  color={iconColor}
                  name={option.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                />
              )}
              <View
                className={cn(
                  "min-w-[22px] rounded-full px-2 py-0.5",
                  active ? "bg-black/15" : "bg-background/80",
                )}
              >
                <Text
                  className={cn(
                    "text-center text-xs font-black",
                    active ? "text-text" : "text-muted",
                  )}
                >
                  {counts[option.key]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function MealBuilderFoodSection({
  title,
  description,
  foods,
  selectedFoodIds,
  selectionItems,
  favoriteFoodIds,
  recentFoodIds,
  defaultGrams,
  selectedTitle,
  stepSize,
  onSelect,
  onToggleFavorite,
  onAdjustAmount,
  onEditAmount,
  onRemove,
  optionalChoiceLabel,
  optionalChoiceSelected,
  onOptionalChoicePress,
}: FoodSectionProps) {
  return (
    <View className="gap-4">
      <SectionCopy description={description} title={title} />

      {optionalChoiceLabel && onOptionalChoicePress ? (
        <OptionalChoiceCard
          label={optionalChoiceLabel}
          onPress={onOptionalChoicePress}
          selected={optionalChoiceSelected === true}
        />
      ) : null}

      <MealSelectionGroup
        items={selectionItems}
        onAdjustAmount={(foodId, delta) => onAdjustAmount(foodId, delta)}
        onEditAmount={onEditAmount}
        onRemove={onRemove}
        stepSize={stepSize}
        title={selectedTitle}
      />

      <MealFoodPicker
        defaultGrams={defaultGrams}
        favoriteFoodIds={favoriteFoodIds}
        foods={foods}
        onSelect={onSelect}
        onToggleFavorite={onToggleFavorite}
        recentFoodIds={recentFoodIds}
        selectedFoodIds={selectedFoodIds}
      />
    </View>
  );
}

export function MealBuilderSupplementsSection({
  title,
  description,
  supplements,
  availableKeys,
  onToggle,
}: SupplementsSectionProps) {
  return (
    <View className="gap-4">
      <SectionCopy description={description} title={title} />
      <MealBuilderSupplementsStep
        availableKeys={availableKeys}
        onToggle={onToggle}
        supplements={supplements}
      />
    </View>
  );
}
