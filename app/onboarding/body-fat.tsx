import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { BodyFatSlider } from "@/src/components/onboarding/body-fat-slider";
import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { NumericInputCard } from "@/src/components/onboarding/numeric-input-card";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { Card } from "@/src/components/ui/card";
import { Toggle } from "@/src/components/ui/toggle";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";
import {
  formatNumberInput,
  getBmiEstimate,
  isBodyFatValid,
  parseNumberInput,
} from "@/src/lib/onboarding";
import type { BodyFatInputMode } from "@/src/types/app";

export default function BodyFatRoute() {
  const { state, syncStep, commitStep, goBack } = useOnboardingWizard();
  const [draftMode, setDraftMode] = useState<BodyFatInputMode>(state.bodyFatMode);
  const [draftBodyFat, setDraftBodyFat] = useState(
    formatNumberInput(state.bodyFatPct, 1),
  );
  const [draftHeight, setDraftHeight] = useState(
    formatNumberInput(state.heightCm, 0),
  );

  useEffect(() => {
    syncStep(3);
  }, [syncStep]);

  useEffect(() => {
    setDraftMode(state.bodyFatMode);
    setDraftBodyFat(formatNumberInput(state.bodyFatPct, 1));
    setDraftHeight(formatNumberInput(state.heightCm, 0));
  }, [state.bodyFatMode, state.bodyFatPct, state.heightCm]);

  const manualBodyFat = parseNumberInput(draftBodyFat);
  const heightCm = parseNumberInput(draftHeight);
  const bmiEstimate = getBmiEstimate({
    ...state,
    bodyFatMode: "bmi",
    heightCm,
  });
  const sliderValue =
    manualBodyFat === null ? Math.max(5, state.bodyFatPct ?? 22) : manualBodyFat;
  const canContinue =
    draftMode === "manual"
      ? isBodyFatValid(manualBodyFat)
      : bmiEstimate.supported && bmiEstimate.estimatedBodyFatPct !== null;

  return (
    <OnboardingStepScreen
      description="Ako znaš procenat masti, to je bolji izbor. Ako ne znaš, procenjujemo ga iz BMI-ja kao praktičnu zamenu."
      onPrimaryPress={() => {
        if (draftMode === "manual" && manualBodyFat !== null) {
          commitStep({
            bodyFatMode: "manual",
            bodyFatPct: manualBodyFat,
          });
        }

        if (
          draftMode === "bmi" &&
          heightCm !== null &&
          bmiEstimate.estimatedBodyFatPct !== null
        ) {
          commitStep({
            bodyFatMode: "bmi",
            bodyFatPct: bmiEstimate.estimatedBodyFatPct,
            heightCm,
          });
        }
      }}
      onBackPress={goBack}
      primaryDisabled={!canContinue}
      primaryLabel="Nastavi"
      step={3}
      title="Procenat telesnih masti"
    >
      <Toggle
        onChange={setDraftMode}
        options={[
          { label: "Znam % masti", value: "manual" },
          { label: "Proceni iz BMI", value: "bmi" },
        ]}
        value={draftMode}
      />

      {draftMode === "manual" ? (
        <>
          <BodyFatSlider
            onChange={(value) => {
              setDraftBodyFat(`${Math.round(value)}`);
            }}
            value={sliderValue}
          />

          <Card className="overflow-hidden px-0 py-0">
            <View className="flex-row">
              <View className="flex-1 items-center border-r border-border px-4 py-4">
                <Text className="text-base font-bold text-text">Atletski</Text>
                <Text className="text-sm text-muted">6-15%</Text>
              </View>
              <View className="flex-1 items-center border-r border-border px-4 py-4">
                <Text className="text-base font-bold text-text">Prosečan</Text>
                <Text className="text-sm text-muted">15-25%</Text>
              </View>
              <View className="flex-1 items-center px-4 py-4">
                <Text className="text-base font-bold text-text">Visok</Text>
                <Text className="text-sm text-muted">26%+</Text>
              </View>
            </View>
          </Card>
        </>
      ) : (
        <>
          <NumericInputCard
            helpText="Ručni bf% je precizniji. BMI procena je dobra zamena kad ne znaš procenat masti."
            large={false}
            label="Visina"
            onChangeText={setDraftHeight}
            placeholder="180"
            suffix="cm"
            value={draftHeight}
          />

          <InfoCallout
            description="Ako si mišićav ili atletski građen, BMI lako može da promaši. Tada je bolji ručni unos bf%."
            title="Upozorenje"
            tone="warning"
          />

          <Card className="gap-2">
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-muted">
              BMI rezultat
            </Text>
            {bmiEstimate.bmi !== null ? (
              <Text className="text-xl font-bold text-text">
                BMI {formatNumberInput(bmiEstimate.bmi, 1)}
              </Text>
            ) : (
              <Text className="text-base text-muted">
                Unesi visinu da izračunamo BMI.
              </Text>
            )}
            {bmiEstimate.estimatedBodyFatPct !== null ? (
              <Text className="text-base leading-6 text-muted-strong">
                Procena telesne masti: {bmiEstimate.estimatedBodyFatPct}%
              </Text>
            ) : bmiEstimate.bmi !== null ? (
              <Text className="text-base leading-6 text-danger">
                Ovaj BMI rezultat nije pogodan za pouzdanu procenu. Prebaci se na ručni unos.
              </Text>
            ) : null}
          </Card>
        </>
      )}

      <InfoCallout
        description="Ovaj broj menja kategoriju, proteinski multiplikator i procenu puta do ciljne težine."
        title="Zašto je važno"
      />
    </OnboardingStepScreen>
  );
}
