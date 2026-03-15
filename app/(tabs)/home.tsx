import { router } from "expo-router";
import { Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { Chip } from "@/src/components/ui/chip";
import { EmptyState } from "@/src/components/ui/empty-state";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { ProgressBar } from "@/src/components/ui/progress-bar";
import { Screen } from "@/src/components/ui/screen";
import { SectionHeader } from "@/src/components/ui/section-header";
import { StatTile } from "@/src/components/ui/stat-tile";
import { useToday } from "@/src/hooks/use-today";
import { usePsmfStore } from "@/src/store/psmf-store";
import {
  selectCaloriesConsumed,
  selectCurrentWeightKg,
  selectEstimatedCalorieTarget,
  selectIsOnboarded,
  selectProteinConsumed,
  selectProtocolProgress,
  selectWaterGlasses,
} from "@/src/store/selectors";

export default function HomeRoute() {
  const data = usePsmfStore((store) => store.data);
  const { today } = useToday();
  const onboarded = selectIsOnboarded(data);

  if (!onboarded) {
    return (
      <Screen>
        <SectionHeader
          description="Početni routing već radi, ali onboarding još nije završen."
          eyebrow="Danas"
          title="Završi onboarding"
        />
        <EmptyState
          badge="Prvi launch"
          description="Faza 1 postavlja store, navigaciju i placeholder rute. Sledeća faza uvodi pravi onboarding state i finalno čuvanje podataka."
          title="Još nema aktivnog plana"
        />
        <PrimaryButton
          label="Idi na onboarding"
          onPress={() => router.replace("/onboarding/welcome")}
        />
      </Screen>
    );
  }

  const proteinConsumed = selectProteinConsumed(data, today);
  const proteinTarget = data.proteinTargetG ?? 0;
  const estimatedCalories = selectEstimatedCalorieTarget(data) ?? 0;
  const caloriesConsumed = selectCaloriesConsumed(data, today);
  const protocol = selectProtocolProgress(data, today);
  const currentWeight = selectCurrentWeightKg(data);
  const waterGlasses = selectWaterGlasses(data, today);

  return (
    <Screen>
      <View className="gap-4">
        <Chip label="Phase 1 shell" variant="warning" />
        <SectionHeader
          description="Dashboard sada čita stvarni Zustand store i hydration stanje. Faze 4-7 će zameniti placeholder kartice finalnim iskustvom."
          eyebrow={`Danas • ${today}`}
          title={`Zdravo, ${data.userName ?? "korisniče"}`}
        />
      </View>

      <Card className="gap-4">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-sm text-muted">Napredak protokola</Text>
            <Text className="text-2xl font-black text-text">
              {protocol.elapsedDays}
              <Text className="text-base font-semibold text-muted">
                {protocol.totalDays ? ` / ${protocol.totalDays} dana` : ""}
              </Text>
            </Text>
          </View>
          <Chip
            label={data.goalType ? `Cilj: ${data.goalType}` : "Cilj uskoro"}
            variant="accent"
          />
        </View>
        <ProgressBar progress={protocol.progress} />
      </Card>

      <View className="gap-4">
        <StatTile
          accent
          label="Protein cilj"
          subtitle={`${proteinConsumed} g uneto danas`}
          value={`${proteinTarget} g`}
        />
        <StatTile
          label="Procenjene kalorije"
          subtitle={`${caloriesConsumed} kcal uneto danas`}
          value={`${estimatedCalories}`}
        />
        <StatTile
          label="Trenutna težina"
          subtitle="Biće povezana sa weight entry tokom faze 5"
          value={currentWeight !== null ? `${currentWeight} kg` : "—"}
        />
        <StatTile
          label="Voda"
          subtitle="Daily tracker stiže u fazi 7"
          value={`${waterGlasses} čaša`}
        />
      </View>
    </Screen>
  );
}
