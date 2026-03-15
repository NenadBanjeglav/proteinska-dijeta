import { useEffect, useState } from "react";
import { Text } from "react-native";

import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { SelectionCard } from "@/src/components/onboarding/selection-card";
import { Card } from "@/src/components/ui/card";
import { GOAL_DAYS } from "@/src/constants/protocol";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";
import type { GoalType } from "@/src/types/app";

export default function GoalRoute() {
  const { state, syncStep, commitStep, goBack } = useOnboardingWizard();
  const [draftGoal, setDraftGoal] = useState<GoalType | null>(state.goalType);

  useEffect(() => {
    syncStep(7);
  }, [syncStep]);

  useEffect(() => {
    setDraftGoal(state.goalType);
  }, [state.goalType]);

  return (
    <OnboardingStepScreen
      description="Trajanje plana se bira deterministicki prema razlogu zbog kog ulazis u PSMF."
      onPrimaryPress={() => {
        if (draftGoal) {
          commitStep({ goalType: draftGoal });
        }
      }}
      onBackPress={goBack}
      primaryDisabled={draftGoal === null}
      primaryLabel="Nastavi"
      step={7}
      title="Tvoj cilj"
    >
      <SelectionCard
        badge="Preporuceno za pocetak"
        description="Brz ulazak u disciplinu i motivacija pre standardnije dijete."
        meta={`${GOAL_DAYS.kickstart} dana`}
        onPress={() => setDraftGoal("kickstart")}
        selected={draftGoal === "kickstart"}
        title="Pokretanje dijete"
      />
      <SelectionCard
        description="Kratko resetovanje kada se napredak zaustavi."
        meta={`${GOAL_DAYS.plateau} dana`}
        onPress={() => setDraftGoal("plateau")}
        selected={draftGoal === "plateau"}
        title="Probijanje platoa"
      />
      <SelectionCard
        description="Maksimalan gubitak masti pre odmora, vencanja ili slicnog dogadjaja."
        meta={`${GOAL_DAYS.event} dana`}
        onPress={() => setDraftGoal("event")}
        selected={draftGoal === "event"}
        title="Priprema za dogadjaj"
      />
      <SelectionCard
        description="Duze drzanje protokola uz vise discipline i planiranih break-ova."
        meta={`${GOAL_DAYS.full} dana`}
        onPress={() => setDraftGoal("full")}
        selected={draftGoal === "full"}
        title="Puna faza mrsavljenja"
      />

      <InfoCallout
        description="V1 cilj koristi ove izbore kao jasan razlog i trajanje protokola, ne kao komplikovan planner."
        title="Ocekivanje"
      />

      {draftGoal ? (
        <Card className="gap-2 border-success bg-surface-soft">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-success">
            Izabrano
          </Text>
          <Text className="text-2xl font-black text-text">
            {GOAL_DAYS[draftGoal]} dana
          </Text>
        </Card>
      ) : null}
    </OnboardingStepScreen>
  );
}
