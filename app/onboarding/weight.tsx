import { OnboardingPlaceholderScreen } from "@/src/components/onboarding/onboarding-placeholder-screen";

export default function WeightRoute() {
  return (
    <OnboardingPlaceholderScreen
      nextHref="/onboarding/body-fat"
      routeKey="weight"
      step={4}
    />
  );
}
