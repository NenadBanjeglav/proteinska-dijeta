import { Text, View } from "react-native";

import { MealCard } from "@/src/components/dashboard/meal-card";
import { Card } from "@/src/components/ui/card";
import { getMealsSummary } from "@/src/lib/dashboard";
import { isMealSavedAsTemplate } from "@/src/lib/meal-templates";
import type { LoggedMeal, MealTemplate } from "@/src/types/app";

type MealsSectionProps = {
  meals: LoggedMeal[];
  mealTemplates: MealTemplate[];
  proteinConsumed: number;
  onEdit: (meal: LoggedMeal) => void;
  onDelete: (meal: LoggedMeal) => void;
  onToggleTemplate: (meal: LoggedMeal) => void;
};

export function MealsSection({
  meals,
  mealTemplates,
  proteinConsumed,
  onEdit,
  onDelete,
  onToggleTemplate,
}: MealsSectionProps) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text className="text-xl font-bold text-text">Danasnji obroci</Text>
        <Text className="text-sm text-muted">
          {getMealsSummary(meals.length, proteinConsumed)}
        </Text>
      </View>

      {meals.length ? (
        meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onDelete={onDelete}
            onEdit={onEdit}
            onToggleTemplate={onToggleTemplate}
            savedAsTemplate={isMealSavedAsTemplate(mealTemplates, meal)}
          />
        ))
      ) : (
        <Card className="gap-2">
          <Text className="text-lg font-bold text-text">
            Jos nema obroka za danas
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Zabelezeni obroci ce se ovde pojaviti tokom dana.
          </Text>
        </Card>
      )}
    </View>
  );
}
