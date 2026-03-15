import { useEffect, useState } from "react";

import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { SelectionCard } from "@/src/components/onboarding/selection-card";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";
import type { Gender } from "@/src/types/app";

export default function GenderRoute() {
  const { state, syncStep, commitStep, goBack } = useOnboardingWizard();
  const [draftGender, setDraftGender] = useState<Gender>(state.gender);

  useEffect(() => {
    syncStep(3);
  }, [syncStep]);

  useEffect(() => {
    setDraftGender(state.gender);
  }, [state.gender]);

  return (
    <OnboardingStepScreen
      description="Pol odredjuje pragove kategorija telesnih masti i kasnije PSMF kategoriju."
      onPrimaryPress={() => {
        commitStep({ gender: draftGender });
      }}
      onBackPress={goBack}
      primaryLabel="Nastavi"
      step={3}
      title="Koji je tvoj pol?"
    >
      <SelectionCard
        description="Kat. 1 <= 15%, kat. 2 16-25%, kat. 3 26%+"
        meta="Nizi pragovi za kategorije telesnih masti."
        onPress={() => setDraftGender("male")}
        selected={draftGender === "male"}
        title="Muski"
      />
      <SelectionCard
        description="Kat. 1 <= 24%, kat. 2 25-34%, kat. 3 35%+"
        meta="Pragovi kategorija su visa nego kod muskaraca."
        onPress={() => setDraftGender("female")}
        selected={draftGender === "female"}
        title="Zenski"
      />

      <InfoCallout
        description="Pol odredjuje pragove kategorija. Proteini se zatim racunaju prema kategoriji i nivou aktivnosti."
        title="Napomena"
      />
    </OnboardingStepScreen>
  );
}
