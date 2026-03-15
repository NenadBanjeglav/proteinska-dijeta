import { Pressable, Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import type { LoggedMeal } from "@/src/types/app";

type MealCardProps = {
  meal: LoggedMeal;
  onEdit: (meal: LoggedMeal) => void;
  onDelete: (meal: LoggedMeal) => void;
};

function buildMealSummary(meal: LoggedMeal) {
  const labels = meal.items.map((item) => item.label.toLowerCase());
  const preview = labels.slice(0, 2).join(", ");

  if (labels.length <= 2) {
    return preview || "Sacuvan obrok";
  }

  return `${preview} + jos ${labels.length - 2}`;
}

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  return (
    <Card className="gap-4 px-4 py-4">
      <View className="flex-row items-start gap-4">
        <View className="flex-1 gap-2">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-xl font-bold text-text">{meal.name}</Text>
            <View className="rounded-full bg-success/15 px-3 py-1">
              <Text className="text-xs font-semibold uppercase tracking-[1.3px] text-success">
                Uneseno
              </Text>
            </View>
          </View>

          <Text className="text-sm leading-5 text-muted">{buildMealSummary(meal)}</Text>
        </View>

        <View className="items-end gap-1">
          <Text
            className="text-3xl font-black text-text"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {meal.proteinG}g
          </Text>
          <Text className="text-sm text-muted">{meal.calories} kcal</Text>
        </View>
      </View>

      <View className="flex-row justify-end gap-2">
        <Pressable
          className="rounded-2xl bg-surface-soft px-4 py-3"
          onPress={() => onEdit(meal)}
        >
          <Text className="text-sm font-semibold text-muted-strong">Izmeni</Text>
        </Pressable>
        <Pressable
          className="rounded-2xl bg-danger/15 px-4 py-3"
          onPress={() => onDelete(meal)}
        >
          <Text className="text-sm font-semibold text-danger">Obrisi</Text>
        </Pressable>
      </View>
    </Card>
  );
}
