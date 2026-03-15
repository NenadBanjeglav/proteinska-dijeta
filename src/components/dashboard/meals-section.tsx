import { Alert, Text, View } from "react-native";

import { ActionPill } from "@/src/components/dashboard/action-pill";
import { MealCard } from "@/src/components/dashboard/meal-card";
import { Card } from "@/src/components/ui/card";
import { getMealsSummary } from "@/src/lib/dashboard";
import type { LoggedMeal } from "@/src/types/app";

type MealsSectionProps = {
  meals: LoggedMeal[];
  proteinConsumed: number;
};

function showPhaseAlert(title: string, message: string) {
  Alert.alert(title, message);
}

export function MealsSection({ meals, proteinConsumed }: MealsSectionProps) {
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
          onPress={() =>
            showPhaseAlert(
              "Dodavanje obroka",
              "Meal logger dolazi u fazi 6. Ovaj shell sada samo priprema mesto za njega.",
            )
          }
          variant="accent"
        />
      </View>

      {meals.length ? (
        meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onDelete={(entry) => {
              showPhaseAlert(
                "Brisanje obroka",
                `Brisanje i izmena obroka stizu u fazi 6. "${entry.name}" je trenutno samo prikazan u shell-u.`,
              );
            }}
            onEdit={(entry) => {
              showPhaseAlert(
                "Izmena obroka",
                `Izmena obroka "${entry.name}" dolazi u fazi 6.`,
              );
            }}
          />
        ))
      ) : (
        <Card className="gap-2">
          <Text className="text-lg font-bold text-text">Jos nema obroka za danas</Text>
          <Text className="text-sm leading-6 text-muted">
            Dodavanje i izmena obroka dolaze u sledecoj fazi. Ovaj ekran je sada spreman
            da prikaze stvarne obroke cim meal logger bude zavrsen.
          </Text>
        </Card>
      )}
    </View>
  );
}
