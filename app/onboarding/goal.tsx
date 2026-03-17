import { useEffect, useState } from "react";

import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { SelectionCard } from "@/src/components/onboarding/selection-card";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";
import type { GoalType } from "@/src/types/app";

export default function GoalRoute() {
  const { state, syncStep, commitStep, goBack } = useOnboardingWizard();
  const [draftGoal, setDraftGoal] = useState<GoalType | null>(state.goalType);

  useEffect(() => {
    syncStep(2);
  }, [syncStep]);

  useEffect(() => {
    setDraftGoal(state.goalType);
  }, [state.goalType]);

  return (
    <OnboardingStepScreen
      description="Izaberi razlog zbog kog ulazis u ovu fazu. Vremensku procenu cemo izracunati tek kad unesemo telo i cilj."
      onPrimaryPress={() => {
        if (draftGoal) {
          commitStep({ goalType: draftGoal });
        }
      }}
      onBackPress={goBack}
      primaryDisabled={draftGoal === null}
      primaryLabel="Nastavi"
      step={2}
      title="Zasto ovo radis?"
    >
      <SelectionCard
        badge="Preporuceno za pocetak"
        description="Zelis jasan ulaz u strozu rutinu bez komplikovanja."
        onPress={() => setDraftGoal("kickstart")}
        selected={draftGoal === "kickstart"}
        title="Pokretanje dijete"
      />
      <SelectionCard
        description="Napredak je usporio i treba ti kratak, agresivniji reset."
        onPress={() => setDraftGoal("plateau")}
        selected={draftGoal === "plateau"}
        title="Probijanje platoa"
      />
      <SelectionCard
        description="Imas konkretan datum ili dogadjaj i hoces fokusiran minus."
        onPress={() => setDraftGoal("event")}
        selected={draftGoal === "event"}
        title="Priprema za dogadjaj"
      />
      <SelectionCard
        description="Spreman si za ozbiljniju fazu i hoces jasnu ciljnu tezinu."
        onPress={() => setDraftGoal("full")}
        selected={draftGoal === "full"}
        title="Puna faza mrsavljenja"
      />

      <InfoCallout
        description="Ovaj izbor zadrzavamo kao kontekst i motivaciju. Trajanje vise ne biras unapred - racunamo ga iz ciljne tezine."
        title="Sta se menja"
      />
    </OnboardingStepScreen>
  );
}
