import { OnboardingPlaceholderScreen } from "@/src/components/onboarding/onboarding-placeholder-screen";

export default function NameRoute() {
  return (
    <OnboardingPlaceholderScreen
      nextHref="/onboarding/gender"
      routeKey="name"
      step={2}
    />
  );
}
