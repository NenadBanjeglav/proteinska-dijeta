import { useEffect, useState } from "react";
import { Text } from "react-native";

import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { NumericInputCard } from "@/src/components/onboarding/numeric-input-card";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { Card } from "@/src/components/ui/card";
import { Toggle } from "@/src/components/ui/toggle";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";
import {
  convertWeightToKg,
  formatWeightForUnit,
  isGoalWeightValid,
  isWeightValid,
  parseNumberInput,
} from "@/src/lib/onboarding";
import { roundTo } from "@/src/lib/units";
import type { Gender, WeightUnit } from "@/src/types/app";

export default function BasicsRoute() {
  const { state, syncStep, commitStep, goBack } = useOnboardingWizard();
  const [draftGender, setDraftGender] = useState<Gender>(state.gender);
  const [draftUnit, setDraftUnit] = useState<WeightUnit>(state.weightUnit);
  const [draftWeight, setDraftWeight] = useState(
    formatWeightForUnit(state.weightKg, state.weightUnit),
  );
  const [draftGoalWeight, setDraftGoalWeight] = useState(
    formatWeightForUnit(state.goalWeightKg, state.weightUnit),
  );

  useEffect(() => {
    syncStep(2);
  }, [syncStep]);

  useEffect(() => {
    setDraftGender(state.gender);
    setDraftUnit(state.weightUnit);
    setDraftWeight(formatWeightForUnit(state.weightKg, state.weightUnit));
    setDraftGoalWeight(formatWeightForUnit(state.goalWeightKg, state.weightUnit));
  }, [state.gender, state.goalWeightKg, state.weightKg, state.weightUnit]);

  const parsedWeight = parseNumberInput(draftWeight);
  const parsedGoalWeight = parseNumberInput(draftGoalWeight);
  const weightKg =
    parsedWeight === null ? null : convertWeightToKg(parsedWeight, draftUnit);
  const goalWeightKg =
    parsedGoalWeight === null ? null : convertWeightToKg(parsedGoalWeight, draftUnit);
  const deltaKg =
    isGoalWeightValid(weightKg, goalWeightKg) && weightKg !== null && goalWeightKg !== null
      ? roundTo(weightKg - goalWeightKg, 1)
      : null;

  const handleUnitChange = (nextUnit: WeightUnit) => {
    setDraftUnit(nextUnit);
    setDraftWeight(formatWeightForUnit(weightKg, nextUnit));
    setDraftGoalWeight(formatWeightForUnit(goalWeightKg, nextUnit));
  };

  return (
    <OnboardingStepScreen
      description="Ovo su osnovni brojevi na kojima gradimo proteinski cilj i procenu puta do ciljne težine."
      onPrimaryPress={() => {
        if (isGoalWeightValid(weightKg, goalWeightKg)) {
          commitStep({
            gender: draftGender,
            weightKg: roundTo(weightKg!, 1),
            goalWeightKg: roundTo(goalWeightKg!, 1),
            weightUnit: draftUnit,
          });
        }
      }}
      onBackPress={goBack}
      primaryDisabled={!isGoalWeightValid(weightKg, goalWeightKg)}
      primaryLabel="Nastavi"
      step={2}
      title="Osnovni podaci"
    >
      <Toggle
        onChange={setDraftGender}
        options={[
          { label: "Muški", value: "male" },
          { label: "Ženski", value: "female" },
        ]}
        value={draftGender}
      />

      <Toggle
        onChange={handleUnitChange}
        options={[
          { label: "kg", value: "kg" },
          { label: "lbs", value: "lbs" },
        ]}
        value={draftUnit}
      />

      <NumericInputCard
        helpText="Trenutna težina je polazna tačka za izračunavanje nemasne mase i proteinskog cilja."
        label="Trenutna težina"
        onChangeText={setDraftWeight}
        placeholder={draftUnit === "kg" ? "84" : "185.2"}
        suffix={draftUnit}
        value={draftWeight}
      />

      <NumericInputCard
        helpText="Ciljna težina služi samo za procenu puta do cilja. Uvek možeš kasnije da je promeniš."
        label="Ciljna težina"
        large={false}
        onChangeText={setDraftGoalWeight}
        placeholder={draftUnit === "kg" ? "76" : "167.5"}
        suffix={draftUnit}
        value={draftGoalWeight}
      />

      {deltaKg !== null ? (
        <Card className="gap-2 border-warning bg-surface-strong">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-warning">
            Minus do cilja
          </Text>
          <Text className="text-3xl font-black text-text">{deltaKg} kg</Text>
          <Text className="text-sm leading-6 text-muted-strong">
            Toliko težine treba da skinemo do cilja. Sledeći koraci su procenat masti i aktivnost.
          </Text>
        </Card>
      ) : null}

      {isWeightValid(weightKg) &&
      isWeightValid(goalWeightKg) &&
      goalWeightKg !== null &&
      weightKg !== null &&
      goalWeightKg >= weightKg ? (
        <InfoCallout
          description="Ciljna težina mora da bude niža od trenutne da bismo imali smislen plan i projekciju."
          title="Proveri cilj"
          tone="warning"
        />
      ) : null}

      <InfoCallout
        description={`Pol menja pragove kategorije, a ciljnu težinu koristimo samo za procenu puta do cilja. Sve težine čuvamo interno u kilogramima.`}
        title="Kako ovo koristimo"
      />
    </OnboardingStepScreen>
  );
}
