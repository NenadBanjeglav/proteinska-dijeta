import { OnboardingPlaceholderScreen } from "@/src/components/onboarding/onboarding-placeholder-screen";

export default function ActivityRoute() {
  return (
    <OnboardingPlaceholderScreen
      nextHref="/onboarding/goal"
      routeKey="activity"
      step={6}
    />
  );
}
