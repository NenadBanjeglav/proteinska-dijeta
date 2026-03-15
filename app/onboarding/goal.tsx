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
      description="Izbor cilja odredjuje koliko dugo traje tvoja pocetna PSMF faza."
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
        description="Kratak i jasan pocetak koji gradi ritam i motivaciju."
        meta={`${GOAL_DAYS.kickstart} dana`}
        onPress={() => setDraftGoal("kickstart")}
        selected={draftGoal === "kickstart"}
        title="Pokretanje dijete"
      />
      <SelectionCard
        description="Kratak reset kada napredak uspori ili stane."
        meta={`${GOAL_DAYS.plateau} dana`}
        onPress={() => setDraftGoal("plateau")}
        selected={draftGoal === "plateau"}
        title="Probijanje platoa"
      />
      <SelectionCard
        description="Fokusiran minus pred odmor, svadbu ili neki drugi konkretan dogadjaj."
        meta={`${GOAL_DAYS.event} dana`}
        onPress={() => setDraftGoal("event")}
        selected={draftGoal === "event"}
        title="Priprema za dogadjaj"
      />
      <SelectionCard
        description="Duze pracenje protokola uz vise discipline i planiranih pauza."
        meta={`${GOAL_DAYS.full} dana`}
        onPress={() => setDraftGoal("full")}
        selected={draftGoal === "full"}
        title="Puna faza mrsavljenja"
      />

      <InfoCallout
        description="Ovaj izbor nam sluzi da odredimo jasan razlog i trajanje pocetne faze. Ne pravimo komplikovan planer."
        title="Sta ovaj izbor znaci"
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
