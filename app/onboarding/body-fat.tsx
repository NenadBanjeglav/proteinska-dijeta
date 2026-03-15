import { OnboardingPlaceholderScreen } from "@/src/components/onboarding/onboarding-placeholder-screen";

export default function BodyFatRoute() {
  return (
    <OnboardingPlaceholderScreen
      nextHref="/onboarding/activity"
      routeKey="body-fat"
      step={5}
    />
  );
}
