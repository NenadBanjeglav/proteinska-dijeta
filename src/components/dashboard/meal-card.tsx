import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { triggerHaptic } from "@/src/lib/haptics";
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
    return preview || "Sačuvan obrok";
  }

  return `${preview} + još ${labels.length - 2}`;
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
            {meal.proteinG} g
          </Text>
          <Text className="text-sm text-muted">{meal.calories} kcal</Text>
        </View>
      </View>

      <View className="flex-row justify-end gap-2 border-t border-border/80 pt-3">
        <Pressable
          accessibilityRole="button"
          className="min-h-[44px] min-w-[112px] flex-row items-center justify-center gap-2 rounded-full border border-border bg-surface-soft px-4 py-3"
          onPress={() => {
            triggerHaptic("selection");
            onEdit(meal);
          }}
        >
          <Ionicons color="#CBD5E1" name="pencil-outline" size={16} />
          <Text className="text-sm font-semibold text-muted-strong">Izmeni</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="min-h-[44px] min-w-[112px] flex-row items-center justify-center gap-2 rounded-full border border-danger/35 bg-danger/10 px-4 py-3"
          onPress={() => {
            triggerHaptic("selection");
            onDelete(meal);
          }}
        >
          <Ionicons color="#F04438" name="trash-outline" size={16} />
          <Text className="text-sm font-semibold text-danger">Obriši</Text>
        </Pressable>
      </View>
    </Card>
  );
}
