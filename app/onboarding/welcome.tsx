import { useEffect } from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";

const BENEFITS = [
  "0.2-0.5 kg gubitka masti dnevno je moguc u pravim uslovima.",
  "Dovoljan unos proteina cuva misice dok skidas mast.",
  "Cilj proteina se racuna prema tvom telu i nivou aktivnosti.",
];

export default function WelcomeRoute() {
  const { goNext, syncStep } = useOnboardingWizard();

  useEffect(() => {
    syncStep(1);
  }, [syncStep]);

  return (
    <OnboardingStepScreen
      description="Najefikasniji protokol za brzo mrsavljenje, naucno potvrdjen i fokusiran na ocuvanje misica."
      onPrimaryPress={goNext}
      primaryLabel="Pocni"
      showBack={false}
      showProgress={false}
      step={1}
      title="Brzo Mrsavljenje"
    >
      <View className="items-center gap-6 pt-4">
        <LinearGradient
          colors={["#FF7A00", "#FF2D20"]}
          end={{ x: 1, y: 0.5 }}
          start={{ x: 0, y: 0.5 }}
          style={{
            alignItems: "center",
            borderRadius: 44,
            height: 88,
            justifyContent: "center",
            width: 88,
          }}
        >
          <Text className="text-3xl font-black text-text">PSMF</Text>
        </LinearGradient>

        <View className="items-center gap-3">
          <Text className="text-center text-4xl font-black text-text">
            Brzo Mrsavljenje
          </Text>
          <Text className="text-center text-sm font-bold uppercase tracking-[1.5px] text-warning">
            Protein Sparing Modified Fast
          </Text>
          <Text className="max-w-[320px] text-center text-base leading-7 text-muted">
            Sacuvaj misice dok gubis masnocu maksimalnom brzinom.
          </Text>
        </View>
      </View>

      <View className="gap-3">
        {BENEFITS.map((benefit) => (
          <View
            key={benefit}
            className="flex-row items-center gap-3 rounded-3xl bg-surface px-4 py-4"
          >
            <View className="h-2.5 w-2.5 rounded-full bg-warning" />
            <Text className="flex-1 text-base leading-6 text-text">{benefit}</Text>
          </View>
        ))}
      </View>

      <InfoCallout
        description="Medicinski zasnovan protokol. Ako imas hronicne probleme ili terapiju, konsultuj lekara pre pocetka."
        title="Vazno"
        tone="warning"
      />

      <Text className="mt-auto text-center text-sm leading-5 text-muted">
        Zasnovano na knjizi Lyle McDonald-a: Rapid Fat Loss Handbook
      </Text>
    </OnboardingStepScreen>
  );
}
