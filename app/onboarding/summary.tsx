import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

import { GoalProjectionCard } from "@/src/components/projection/goal-projection-card";
import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { Card } from "@/src/components/ui/card";
import { Chip } from "@/src/components/ui/chip";
import { GOAL_LABELS, SUPPLEMENT_CHECKLIST } from "@/src/constants/protocol";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";
import { calcWaterTargetGlasses } from "@/src/lib/psmf";

export default function SummaryRoute() {
  const { state, syncStep, preview, confirm, goBack, isSubmitting } =
    useOnboardingWizard();
  const [draftName, setDraftName] = useState(state.userName);

  useEffect(() => {
    syncStep(6);
  }, [syncStep]);

  useEffect(() => {
    setDraftName(state.userName);
  }, [state.userName]);

  const waterTarget =
    state.weightKg === null ? null : calcWaterTargetGlasses(state.weightKg);
  const canConfirm = !!preview && preview.projection.status !== "invalid";

  return (
    <OnboardingStepScreen
      description="Plan je spreman. Jos jednom pogledaj brojke, a ime unesi samo ako hoces licniji ton u aplikaciji."
      onPrimaryPress={() => {
        void confirm({ userName: draftName });
      }}
      onBackPress={goBack}
      primaryDisabled={!canConfirm}
      primaryLabel="Pocni danas"
      primaryLoading={isSubmitting}
      progressLabel="Gotovo"
      scroll
      step={6}
      title="Potvrda plana"
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
              <View className="items-end gap-2">
                <Chip label={`Kategorija ${preview.category}`} variant="accent" />
                <Chip label={GOAL_LABELS[state.goalType!]} variant="warning" />
              </View>
            </View>
            <Text className="text-base leading-6 text-muted-strong">
              Oko {preview.estimatedCalories} kcal dnevno - ciljna tezina{" "}
              {preview.goalWeightKg} kg
            </Text>
          </Card>

          <GoalProjectionCard
            description="Ovo je pocetna procena. Posle onboarding-a grafik ce se osvezavati po tvojoj stvarnoj jutarnjoj tezini."
            eyebrow="Put do cilja"
            projection={preview.projection}
            title="Procena do ciljne tezine"
          />

          <Card className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted">
              Prvi dan
            </Text>
            <Text className="text-sm leading-6 text-muted-strong">
              - Pogodi {preview.proteinTargetG} g proteina.
            </Text>
            {waterTarget !== null ? (
              <Text className="text-sm leading-6 text-muted-strong">
                - Popij oko {waterTarget} casa vode.
              </Text>
            ) : null}
            <Text className="text-sm leading-6 text-muted-strong">
              - Izmeri jutarnju tezinu odmah po budjenju, posle toaleta, pre hrane i vode.
            </Text>
            {SUPPLEMENT_CHECKLIST.map((item) => (
              <Text key={item} className="text-sm leading-6 text-muted-strong">
                - {item}
              </Text>
            ))}
          </Card>

          <Card className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted">
              Ime je opciono
            </Text>
            <TextInput
              autoCapitalize="words"
              autoCorrect={false}
              className="rounded-3xl bg-surface-soft px-5 py-4 text-2xl font-bold text-text"
              onChangeText={setDraftName}
              placeholder="Upisi ime ili ostavi prazno"
              placeholderTextColor="#64748B"
              value={draftName}
            />
            <Text className="text-sm leading-6 text-muted">
              Ako ostavis prazno, aplikacija ce koristiti neutralan pozdrav.
            </Text>
          </Card>

          <InfoCallout
            description="Kada potvrdis, cuvamo plan lokalno na telefonu. Ciljna tezina moze kasnije da se menja iz podesavanja."
            title="Posle potvrde"
          />
        </>
      ) : (
        <Card className="gap-2 border-danger bg-surface-soft">
          <Text className="text-base font-bold text-danger">
            Plan jos nije spreman.
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Vrati se korak nazad i proveri procenat masti, aktivnost ili ciljnu tezinu.
          </Text>
        </Card>
      )}
    </OnboardingStepScreen>
  );
}
