import { useEffect } from "react";
import { Text, View } from "react-native";

import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { Card } from "@/src/components/ui/card";
import { Chip } from "@/src/components/ui/chip";
import { SUPPLEMENT_GUIDANCE } from "@/src/constants/protocol";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";
import {
  formatProteinMultiplierLabel,
  formatProteinRangeLabel,
  isProteinRangeFixed,
} from "@/src/lib/onboarding";

export default function SummaryRoute() {
  const { state, syncStep, preview, confirm, goBack, isSubmitting } =
    useOnboardingWizard();

  useEffect(() => {
    syncStep(8);
  }, [syncStep]);

  const rangeLabel = preview ? formatProteinRangeLabel(preview.proteinRange) : null;
  const multiplierLabel = preview
    ? formatProteinMultiplierLabel(preview.proteinMultiplier)
    : null;
  const hasFixedRange = preview ? isProteinRangeFixed(preview.proteinRange) : false;

  return (
    <OnboardingStepScreen
      description="Plan je spreman. Pregledaj brojke i potvrdi pocetak."
      onPrimaryPress={() => {
        void confirm();
      }}
      onBackPress={goBack}
      primaryDisabled={!preview}
      primaryLabel="Pocni PSMF danas"
      primaryLoading={isSubmitting}
      progressLabel="Gotovo!"
      scroll
      showBack={false}
      step={8}
      title="Rezime"
    >
      {preview ? (
        <>
          <Card className="gap-3 border-warning bg-surface-strong">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-1">
                <Text className="text-xs font-semibold uppercase tracking-[2px] text-warning">
                  Dnevni cilj proteina
                </Text>
                <Text className="text-5xl font-black text-text">
                  {preview.proteinTargetG} g
                </Text>
              </View>
              <Chip label={`Kategorija ${preview.category}`} variant="accent" />
            </View>
            <Text className="text-base leading-6 text-muted-strong">
              Oko {preview.estimatedCalories} kcal dnevno - nemasna masa{" "}
              {preview.leanBodyMassKg} kg / {preview.leanBodyMassLbs} lb
            </Text>
            <Text className="text-sm leading-6 text-muted-strong">
              {hasFixedRange
                ? `Fiksni multiplikator ${multiplierLabel}`
                : `Tvoj multiplikator je ${multiplierLabel}, a preporuceni raspon ${rangeLabel}`}
            </Text>
            {state.bodyFatMode === "bmi" && preview.bmi !== null ? (
              <InfoCallout
                description={`Koriscena je BMI procena (BMI ${preview.bmi}). Ako si misicav ili atletski gradjen, bolji izbor je rucni unos procenta masti.`}
                tone="warning"
              />
            ) : null}
          </Card>

          <Card className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted">
              Kako smo izracunali
            </Text>
            <Text className="text-base leading-6 text-muted-strong">
              Start tezina: {state.weightKg} kg
            </Text>
            <Text className="text-base leading-6 text-muted-strong">
              Procena masti: {preview.bodyFatPct}%
            </Text>
            <Text className="text-base leading-6 text-muted-strong">
              Kategorija: {preview.category}
            </Text>
            <Text className="text-base leading-6 text-muted-strong">
              Trajanje plana: {preview.goalTotalDays} dana
            </Text>
          </Card>

          <Card className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted">
              Sta uzimati svaki dan
            </Text>
            {SUPPLEMENT_GUIDANCE.map((item) => (
              <Text key={item} className="text-sm leading-6 text-muted-strong">
                - {item}
              </Text>
            ))}
          </Card>

          <InfoCallout
            description="Kada potvrdis, plan se cuva lokalno na telefonu. Sledeci put nastavljas odatle."
            title="Posle potvrde"
          />
        </>
      ) : (
        <Card className="gap-2 border-danger bg-surface-soft">
          <Text className="text-base font-bold text-danger">
            Rezime jos nije spreman.
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Vrati se na prethodne korake i dovrsi podatke pre potvrde.
          </Text>
        </Card>
      )}
    </OnboardingStepScreen>
  );
}
