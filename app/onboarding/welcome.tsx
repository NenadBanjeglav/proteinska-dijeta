import { OnboardingPlaceholderScreen } from "@/src/components/onboarding/onboarding-placeholder-screen";

export default function WelcomeRoute() {
  return (
    <OnboardingPlaceholderScreen
      nextHref="/onboarding/name"
      routeKey="welcome"
      showBack={false}
      showProgress={false}
      step={1}
    />
  );
}
