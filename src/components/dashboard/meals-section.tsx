import { Text, View } from "react-native";

import { ActionPill } from "@/src/components/dashboard/action-pill";
import { MealCard } from "@/src/components/dashboard/meal-card";
import { Card } from "@/src/components/ui/card";
import { getMealsSummary } from "@/src/lib/dashboard";
import type { LoggedMeal } from "@/src/types/app";

type MealsSectionProps = {
  meals: LoggedMeal[];
  proteinConsumed: number;
  onAdd: () => void;
  onEdit: (meal: LoggedMeal) => void;
  onDelete: (meal: LoggedMeal) => void;
};

export function MealsSection({
  meals,
  proteinConsumed,
  onAdd,
  onEdit,
  onDelete,
}: MealsSectionProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between gap-4">
        <View className="flex-1 gap-1">
          <Text className="text-2xl font-bold text-text">Danasnji obroci</Text>
          <Text className="text-sm text-muted">
            {getMealsSummary(meals.length, proteinConsumed)}
          </Text>
        </View>

        <ActionPill
          label="+ Dodaj obrok"
          onPress={onAdd}
          variant="accent"
        />
      </View>

      {meals.length ? (
        meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))
      ) : (
        <Card className="gap-2">
          <Text className="text-lg font-bold text-text">Jos nema obroka za danas</Text>
          <Text className="text-sm leading-6 text-muted">
            Dodaj prvi obrok i prati koliko si se priblizio dnevnom proteinskom cilju.
          </Text>
        </Card>
      )}
    </View>
  );
}
