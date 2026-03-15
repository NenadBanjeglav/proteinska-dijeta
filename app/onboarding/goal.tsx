import { OnboardingPlaceholderScreen } from "@/src/components/onboarding/onboarding-placeholder-screen";

export default function GoalRoute() {
  return (
    <OnboardingPlaceholderScreen
      nextHref="/onboarding/summary"
      routeKey="goal"
      step={7}
    />
  );
}
