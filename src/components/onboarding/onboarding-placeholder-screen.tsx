import { router, type Href } from "expo-router";
import { Text, View } from "react-native";

import { Chip } from "@/src/components/ui/chip";
import { EmptyState } from "@/src/components/ui/empty-state";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { Screen } from "@/src/components/ui/screen";
import { Card } from "@/src/components/ui/card";
import {
  ONBOARDING_PLACEHOLDERS,
  ONBOARDING_STEP_COUNT,
} from "@/src/constants/copy";
import { StepHeader } from "@/src/components/onboarding/step-header";

type PlaceholderKey = keyof typeof ONBOARDING_PLACEHOLDERS;

type OnboardingPlaceholderScreenProps = {
  routeKey: PlaceholderKey;
  step: number;
  nextHref?: Href;
  showBack?: boolean;
  showProgress?: boolean;
};

export function OnboardingPlaceholderScreen({
  routeKey,
  step,
  nextHref,
  showBack = true,
  showProgress = true,
}: OnboardingPlaceholderScreenProps) {
  const copy = ONBOARDING_PLACEHOLDERS[routeKey];

  return (
    <Screen contentClassName="justify-between" scroll={false}>
      <View className="gap-6">
        <StepHeader
          description={copy.description}
          showProgress={showProgress}
          step={step}
          title={copy.title}
          total={ONBOARDING_STEP_COUNT}
        />
        <Card className="gap-4">
          <Chip label="Phase 1 placeholder" variant="warning" />
          <Text className="text-base leading-6 text-muted">
            Logika i konačan UI za ovaj korak ulaze u faze 2 i 3. Route,
            navigacija i foundation sloj su sada spremni.
          </Text>
        </Card>
        <EmptyState
          badge="Mock-ready"
          description="Vizuelni detalji će se direktno pratiti prema onboarding mockovima iz foldera /mocks/onboarding."
          title="Onboarding shell je povezan"
        />
      </View>

      <View className="gap-3">
        {nextHref ? (
          <PrimaryButton label="Nastavi" onPress={() => router.push(nextHref)} />
        ) : (
          <PrimaryButton disabled label="Finalna potvrda dolazi u fazi 2" onPress={() => {}} />
        )}
        {showBack ? (
          <PrimaryButton
            label="Nazad"
            onPress={() => router.back()}
            variant="ghost"
          />
        ) : null}
      </View>
    </Screen>
  );
}
