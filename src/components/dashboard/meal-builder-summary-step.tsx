import { Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { SUPPLEMENT_CHECKLIST } from "@/src/constants/protocol";
import type { LoggedMeal } from "@/src/types/app";

type MealBuilderSummaryStepProps = {
  previewMeal: LoggedMeal | null;
};

export function MealBuilderSummaryStep({
  previewMeal,
}: MealBuilderSummaryStepProps) {
  return (
    <>
      <Card className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
          Dnevni suplementi
        </Text>
        {SUPPLEMENT_CHECKLIST.map((item) => (
          <View key={item} className="flex-row items-center gap-3">
            <View className="h-2.5 w-2.5 rounded-full bg-warning" />
            <Text className="flex-1 text-sm leading-6 text-muted-strong">{item}</Text>
          </View>
        ))}
        <Text className="text-sm leading-6 text-muted">
          Ovo je samo podsetnik. Suplemente ovde ne upisujemo kao deo obroka.
        </Text>
      </Card>

      <Card className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
          Rezime obroka
        </Text>
        {previewMeal?.items.map((item) => (
          <View key={item.id} className="flex-row items-center justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-text">{item.label}</Text>
              <Text className="text-sm text-muted">{item.grams}g</Text>
            </View>
            <View className="items-end gap-1">
              <Text className="text-base font-bold text-text">{item.proteinG}g</Text>
              <Text className="text-sm text-muted">{item.calories} kcal</Text>
            </View>
          </View>
        ))}
        <View className="border-t border-border pt-3">
          <Text className="text-sm leading-6 text-muted">
          Protein neka ostane osnova obroka, povrće dodaj po potrebi, a dodatke koristi umereno.
          </Text>
        </View>
        <View className="flex-row items-end justify-between gap-3">
          <Text className="text-lg font-bold text-text">{previewMeal?.name ?? "Obrok"}</Text>
          <View className="items-end gap-1">
            <Text className="text-2xl font-black text-text">
              {previewMeal?.proteinG ?? 0}g
            </Text>
            <Text className="text-sm text-muted">{previewMeal?.calories ?? 0} kcal</Text>
          </View>
        </View>
      </Card>
    </>
  );
}
