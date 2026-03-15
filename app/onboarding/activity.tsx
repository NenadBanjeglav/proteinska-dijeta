import { useEffect, useState } from "react";
import { Text } from "react-native";

import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { SelectionCard } from "@/src/components/onboarding/selection-card";
import { Card } from "@/src/components/ui/card";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";
import {
  buildProteinPreview,
  formatProteinMultiplierLabel,
  formatProteinRangeLabel,
  isProteinRangeFixed,
} from "@/src/lib/onboarding";
import type { Activity } from "@/src/types/app";

export default function ActivityRoute() {
  const { state, syncStep, commitStep, goBack } = useOnboardingWizard();
  const [draftActivity, setDraftActivity] = useState<Activity | null>(state.activity);

  useEffect(() => {
    syncStep(6);
  }, [syncStep]);

  useEffect(() => {
    setDraftActivity(state.activity);
  }, [state.activity]);

  const preview =
    draftActivity === null
      ? null
      : buildProteinPreview({ ...state, activity: draftActivity });
  const hasFixedRange = preview ? isProteinRangeFixed(preview.proteinRange) : false;
  const rangeLabel = preview ? formatProteinRangeLabel(preview.proteinRange) : null;
  const multiplierLabel = preview
    ? formatProteinMultiplierLabel(preview.proteinMultiplier)
    : null;

  return (
    <OnboardingStepScreen
      description="Nivo aktivnosti menja proteinski multiplikator i direktno utice na dnevni cilj."
      onPrimaryPress={() => {
        if (draftActivity) {
          commitStep({ activity: draftActivity });
        }
      }}
      onBackPress={goBack}
      primaryDisabled={draftActivity === null}
      primaryLabel="Nastavi"
      step={6}
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

      {preview ? (
        <Card className="gap-3 border-warning bg-surface-strong">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-warning">
            Pregled cilja
          </Text>
          <Text className="text-4xl font-black text-text">
            {preview.proteinTargetG} g
          </Text>
          <Text className="text-base font-semibold text-text">
            Kategorija {preview.category}
          </Text>
          <Text className="text-base leading-6 text-muted-strong">
            {hasFixedRange
              ? `Fiksni multiplikator ${multiplierLabel}`
              : `Preporuceni raspon je ${rangeLabel}, a tvoj multiplikator ${multiplierLabel}`}
          </Text>
        </Card>
      ) : null}

      <InfoCallout
        description={
          preview && !hasFixedRange
            ? "Ako si u kategoriji 1, nizi procenat masti pomera cilj ka gornjoj granici preporucenog raspona."
            : "U kategorijama 2 i 3 multiplikator je fiksan za izabrani nivo aktivnosti."
        }
        title="Kako da citas ovaj prikaz"
      />
    </OnboardingStepScreen>
  );
}
