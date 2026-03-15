import { OnboardingPlaceholderScreen } from "@/src/components/onboarding/onboarding-placeholder-screen";

export default function GenderRoute() {
  return (
    <OnboardingPlaceholderScreen
      nextHref="/onboarding/weight"
      routeKey="gender"
      step={3}
    />
  );
}
