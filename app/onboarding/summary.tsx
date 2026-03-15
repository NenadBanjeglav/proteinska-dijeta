import { useEffect } from "react";
import { Text, View } from "react-native";

import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { Card } from "@/src/components/ui/card";
import { Chip } from "@/src/components/ui/chip";
import { SUPPLEMENT_GUIDANCE } from "@/src/constants/protocol";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";

export default function SummaryRoute() {
  const { state, syncStep, preview, confirm, goBack, isSubmitting } =
    useOnboardingWizard();

  useEffect(() => {
    syncStep(8);
  }, [syncStep]);

  const rangeLabel = preview
    ? `${preview.proteinRange[0]}-${preview.proteinRange[1]} g/lb`
    : null;

  return (
    <OnboardingStepScreen
      description="Ovo je finalni payload koji se upisuje u Zustand i AsyncStorage jednim potvrdom."
      onPrimaryPress={() => {
        void confirm();
      }}
      primaryDisabled={!preview}
      primaryLabel="Pocni PSMF Danas"
      primaryLoading={isSubmitting}
      onBackPress={goBack}
      progressLabel="Gotovo!"
      scroll
      showBack={false}
      step={8}
      title="Rezime"
    >
      {preview ? (
        <>
          <View className="items-center pb-1 pt-2">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-success/15">
              <Text className="text-4xl font-black text-success">OK</Text>
            </View>
          </View>

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
              Oko {preview.estimatedCalories} kcal dnevno - LBM{" "}
              {preview.leanBodyMassKg} kg / {preview.leanBodyMassLbs} lb
            </Text>
            <Text className="text-sm leading-6 text-muted-strong">
              Multiplikator {preview.proteinMultiplier} - raspon {rangeLabel}
            </Text>
            {state.bodyFatMode === "bmi" && preview.bmi !== null ? (
              <InfoCallout
                description={`BMI fallback je koriscen (BMI ${preview.bmi}). Ako si misicav ili atletski gradjen, manualni % masti je bolji izbor.`}
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
            description="Finalna potvrda sada upisuje startDate, cilj proteina, kategoriju i sve onboarding podatke u lokalni store."
            title="Sta se desava na potvrdu"
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
