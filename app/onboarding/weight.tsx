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
  formatNumberInput,
  formatWeightForUnit,
  isWeightValid,
  parseNumberInput,
} from "@/src/lib/onboarding";
import { kgToLbs, roundTo } from "@/src/lib/units";
import type { WeightUnit } from "@/src/types/app";

export default function WeightRoute() {
  const { state, syncStep, commitStep, goBack } = useOnboardingWizard();
  const [draftUnit, setDraftUnit] = useState<WeightUnit>(state.weightUnit);
  const [draftValue, setDraftValue] = useState(
    formatWeightForUnit(state.weightKg, state.weightUnit),
  );

  useEffect(() => {
    syncStep(4);
  }, [syncStep]);

  useEffect(() => {
    setDraftUnit(state.weightUnit);
    setDraftValue(formatWeightForUnit(state.weightKg, state.weightUnit));
  }, [state.weightKg, state.weightUnit]);

  const parsedWeight = parseNumberInput(draftValue);
  const weightKg =
    parsedWeight === null ? null : convertWeightToKg(parsedWeight, draftUnit);
  const alternateUnit = draftUnit === "kg" ? "lbs" : "kg";
  const alternateValue =
    weightKg === null
      ? ""
      : alternateUnit === "kg"
        ? formatNumberInput(weightKg, 1)
        : formatNumberInput(kgToLbs(weightKg), 1);

  const handleUnitChange = (nextUnit: WeightUnit) => {
    const nextWeight =
      parsedWeight === null
        ? state.weightKg
        : convertWeightToKg(parsedWeight, draftUnit);
    setDraftUnit(nextUnit);
    setDraftValue(formatWeightForUnit(nextWeight, nextUnit));
  };

  return (
    <OnboardingStepScreen
      description="Tezina nam sluzi za racunanje nemasne mase, BMI procene i dnevnog cilja proteina."
      onPrimaryPress={() => {
        if (weightKg !== null) {
          commitStep({
            weightKg: roundTo(weightKg, 1),
            weightUnit: draftUnit,
          });
        }
      }}
      onBackPress={goBack}
      primaryDisabled={!isWeightValid(weightKg)}
      primaryLabel="Nastavi"
      step={4}
      title="Trenutna tezina"
    >
      <Toggle
        onChange={handleUnitChange}
        options={[
          { label: "kg", value: "kg" },
          { label: "lbs", value: "lbs" },
        ]}
        value={draftUnit}
      />

      <NumericInputCard
        helpText="Tezinu cuvamo u kilogramima, bez obzira na to koju jedinicu trenutno gledas."
        label="Tvoja tezina"
        onChangeText={setDraftValue}
        placeholder={draftUnit === "kg" ? "84" : "185.2"}
        suffix={draftUnit}
        value={draftValue}
      />

      {isWeightValid(weightKg) ? (
        <Card className="items-center gap-2">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-muted">
            Prikaz u drugoj jedinici
          </Text>
          <Text className="text-xl font-bold text-text">
            {alternateValue} {alternateUnit}
          </Text>
        </Card>
      ) : null}

      <InfoCallout
        description="Ako treniras sa tegovima, moguce je da imas vise misica nego sto vaga sugerise. U sledecem koraku unosis procenat masti ili biras BMI procenu."
        title="Napomena"
      />
    </OnboardingStepScreen>
  );
}
