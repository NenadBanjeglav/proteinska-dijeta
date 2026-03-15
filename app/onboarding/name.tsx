import { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";

import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { Card } from "@/src/components/ui/card";
import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";
import { isNameValid } from "@/src/lib/onboarding";

export default function NameRoute() {
  const { state, syncStep, commitStep, goBack } = useOnboardingWizard();
  const [draftName, setDraftName] = useState(state.userName);

  useEffect(() => {
    syncStep(2);
  }, [syncStep]);

  useEffect(() => {
    setDraftName(state.userName);
  }, [state.userName]);

  const trimmedName = draftName.trim();

  return (
    <OnboardingStepScreen
      description="Koristimo tvoje ime za pozdrav i licni ton kroz ceo protokol."
      onPrimaryPress={() => {
        commitStep({ userName: trimmedName });
      }}
      onBackPress={goBack}
      primaryDisabled={!isNameValid(draftName)}
      primaryLabel="Nastavi"
      step={2}
      title="Kako se zoves?"
    >
      <Card className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted">
          Tvoje ime
        </Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          className="rounded-3xl bg-surface-soft px-5 py-4 text-2xl font-bold text-text"
          onChangeText={setDraftName}
          placeholder="Upisi ime"
          placeholderTextColor="#64748B"
          value={draftName}
        />
      </Card>

      {isNameValid(draftName) ? (
        <InfoCallout
          description="Hajde da ti napravimo plan koji prati tvoj ritam i cilj."
          title={`Zdravo, ${trimmedName}.`}
          tone="warning"
        />
      ) : null}
    </OnboardingStepScreen>
  );
}
