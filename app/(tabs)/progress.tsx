import { Text, View } from "react-native";

import { EmptyState } from "@/src/components/ui/empty-state";
import { Screen } from "@/src/components/ui/screen";
import { SectionHeader } from "@/src/components/ui/section-header";
import { StatTile } from "@/src/components/ui/stat-tile";
import { WeightChart } from "@/src/components/progress/weight-chart";
import { usePsmfStore } from "@/src/store/psmf-store";
import {
  selectChartEntries,
  selectCurrentWeightKg,
  selectIsOnboarded,
} from "@/src/store/selectors";

export default function ProgressRoute() {
  const data = usePsmfStore((store) => store.data);
  const onboarded = selectIsOnboarded(data);

  if (!onboarded) {
    return (
      <Screen>
        <SectionHeader
          description="Napredak se otključava kada onboarding upiše početne podatke u store."
          eyebrow="Napredak"
          title="Još nema istorije"
        />
        <EmptyState
          badge="Čeka onboarding"
          description="Foundation sloj je spreman: hydration, selectori i chart wrapper postoje. Sledeće faze će puniti pravi sadržaj."
          title="Screen shell je spreman"
        />
      </Screen>
    );
  }

  const entries = selectChartEntries(data);
  const currentWeight = selectCurrentWeightKg(data);

  return (
    <Screen>
      <SectionHeader
        description="Phase 1 uvodi chart wrapper i derived selectore. Faza 8 dodaje finalne statove, milestone kartice i puni izgled iz mocka."
        eyebrow="Napredak"
        title="Pregled istorije"
      />

      <StatTile
        label="Poslednja poznata težina"
        subtitle={`${entries.length} unosa u istoriji`}
        value={currentWeight !== null ? `${currentWeight} kg` : "—"}
      />

      <View className="gap-3">
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-muted">
          WeightChart wrapper
        </Text>
        <WeightChart entries={entries} />
      </View>
    </Screen>
  );
}
