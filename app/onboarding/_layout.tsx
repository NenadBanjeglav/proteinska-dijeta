import { Redirect, Stack } from "expo-router";

import { OnboardingWizardProvider } from "@/src/hooks/use-onboarding-wizard";
import { usePsmfStore } from "@/src/store/psmf-store";
import { selectIsOnboarded } from "@/src/store/selectors";

function OnboardingStack() {
  const data = usePsmfStore((store) => store.data);

  if (selectIsOnboarded(data)) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0B0C11" },
        headerShown: false,
      }}
    />
  );
}

export default function OnboardingLayout() {
  return (
    <OnboardingWizardProvider>
      <OnboardingStack />
    </OnboardingWizardProvider>
  );
}
