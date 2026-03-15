import { useEffect, useState } from "react";
import { Text } from "react-native";

import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { SelectionCard } from "@/src/components/onboarding/selection-card";
import { Card } from "@/src/components/ui/card";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";
import { buildProteinPreview } from "@/src/lib/onboarding";
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

  return (
    <OnboardingStepScreen
      description="Aktivnost bira PSMF multiplikator i direktno menja dnevni cilj proteina."
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
        description="Sedentaran rad i bez redovnog treninga."
        onPress={() => setDraftActivity("inactive")}
        selected={draftActivity === "inactive"}
        title="Neaktivan"
      />
      <SelectionCard
        description="Redovan aerobni ili kardio trening."
        onPress={() => setDraftActivity("aerobics")}
        selected={draftActivity === "aerobics"}
        title="Kardio"
      />
      <SelectionCard
        description="Redovni treninzi sa tegovima i rad na zadrzavanju misica."
        onPress={() => setDraftActivity("weights")}
        selected={draftActivity === "weights"}
        title="Trening sa tegovima"
      />

      {preview ? (
        <Card className="gap-3 border-warning bg-surface-strong">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-warning">
            Live preview
          </Text>
          <Text className="text-4xl font-black text-text">
            {preview.proteinTargetG} g
          </Text>
          <Text className="text-base leading-6 text-muted-strong">
            Kategorija {preview.category} - {preview.proteinRange[0]}-
            {preview.proteinRange[1]} g/lb - multiplikator{" "}
            {preview.proteinMultiplier}
          </Text>
        </Card>
      ) : null}

      <InfoCallout
        description="Nizi procenat masti unutar kategorije 1 gura target ka gornjoj granici handbook raspona."
        title="Kako citati preview"
      />
    </OnboardingStepScreen>
  );
}
