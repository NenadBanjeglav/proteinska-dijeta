import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { GoalProjectionCard } from "@/src/components/projection/goal-projection-card";
import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { SelectionCard } from "@/src/components/onboarding/selection-card";
import { Card } from "@/src/components/ui/card";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";
import {
  buildOnboardingPreview,
  formatProteinMultiplierLabel,
  formatProteinRangeLabel,
  isProteinRangeFixed,
} from "@/src/lib/onboarding";
import type { Activity } from "@/src/types/app";

export default function ActivityRoute() {
  const { state, syncStep, commitStep, goBack } = useOnboardingWizard();
  const [draftActivity, setDraftActivity] = useState<Activity | null>(state.activity);

  useEffect(() => {
    syncStep(5);
  }, [syncStep]);

  useEffect(() => {
    setDraftActivity(state.activity);
  }, [state.activity]);

  const preview =
    draftActivity === null
      ? null
      : buildOnboardingPreview({ ...state, activity: draftActivity });
  const proteinPreview = preview;
  const hasFixedRange =
    proteinPreview ? isProteinRangeFixed(proteinPreview.proteinRange) : false;
  const rangeLabel = proteinPreview
    ? formatProteinRangeLabel(proteinPreview.proteinRange)
    : null;
  const multiplierLabel = proteinPreview
    ? formatProteinMultiplierLabel(proteinPreview.proteinMultiplier)
    : null;
  const canContinue =
    draftActivity !== null &&
    preview !== null &&
    preview.projection.status !== "invalid";

  return (
    <OnboardingStepScreen
      description="Nivo aktivnosti menja proteinski multiplikator i kalorijski minus, pa tek ovde dobijamo prvu ozbiljnu procenu."
      onPrimaryPress={() => {
        if (draftActivity && canContinue) {
          commitStep({ activity: draftActivity });
        }
      }}
      onBackPress={goBack}
      primaryDisabled={!canContinue}
      primaryLabel="Pregledaj plan"
      step={5}
      title="Nivo aktivnosti"
    >
      <SelectionCard
        description="Sedentaran dan i bez redovnog treninga."
        onPress={() => setDraftActivity("inactive")}
        selected={draftActivity === "inactive"}
        title="Neaktivan"
      />
      <SelectionCard
        description="Redovan kardio ili drugi aerobni treninzi."
        onPress={() => setDraftActivity("aerobics")}
        selected={draftActivity === "aerobics"}
        title="Kardio"
      />
      <SelectionCard
        description="Redovni treninzi sa tegovima i fokus na ocuvanje misica."
        onPress={() => setDraftActivity("weights")}
        selected={draftActivity === "weights"}
        title="Trening sa tegovima"
      />

      {proteinPreview ? (
        <Card className="gap-3 border-warning bg-surface-strong">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text className="text-sm font-semibold uppercase tracking-[2px] text-warning">
                Dnevni cilj proteina
              </Text>
              <Text className="text-4xl font-black text-text">
                {proteinPreview.proteinTargetG} g
              </Text>
            </View>
            <View className="items-end gap-1">
              <Text className="text-sm text-muted">Kategorija</Text>
              <Text className="text-2xl font-black text-text">
                {proteinPreview.category}
              </Text>
            </View>
          </View>
          <Text className="text-base leading-6 text-muted-strong">
            Oko {proteinPreview.estimatedCalories} kcal dnevno - nemasna masa{" "}
            {proteinPreview.leanBodyMassKg} kg / {proteinPreview.leanBodyMassLbs} lb
          </Text>
          <Text className="text-sm leading-6 text-muted-strong">
            {hasFixedRange
              ? `Fiksni multiplikator ${multiplierLabel}`
              : `Preporuceni raspon je ${rangeLabel}, a tvoj multiplikator ${multiplierLabel}`}
          </Text>
        </Card>
      ) : null}

      {preview ? (
        <GoalProjectionCard
          description="Procena pretpostavlja strogi PSMF bez planiranih pauza i azurira se kasnije po tvojoj stvarnoj tezini."
          eyebrow="Procena puta do cilja"
          projection={preview.projection}
          title="Koliko traje do ciljne tezine"
        />
      ) : null}

      <InfoCallout
        description="Ako menjas aktivnost, menjaju se i protein cilj i procena trajanja. Zato je ovo glavni trenutak kada plan dobija smisao."
        title="Kako da citas ovo"
      />
    </OnboardingStepScreen>
  );
}
