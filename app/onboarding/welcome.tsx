import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { InfoCallout } from "@/src/components/onboarding/info-callout";
import { OnboardingStepScreen } from "@/src/components/onboarding/onboarding-step-screen";
import { useOnboardingWizard } from "@/src/hooks/use-onboarding-wizard";

const BENEFITS = [
  "Dobijas dnevni cilj proteina prilagodjen telu, aktivnosti i cilju.",
  "Odmah vidis grubu procenu koliko dugo traje put do ciljne tezine.",
  "Sve ostaje lokalno na telefonu, bez naloga i komplikacija.",
];

export default function WelcomeRoute() {
  const { goNext, syncStep } = useOnboardingWizard();

  useEffect(() => {
    syncStep(1);
  }, [syncStep]);

  return (
    <OnboardingStepScreen
      description="Za manje od minuta izracunaj protein cilj i procenu koliko ti treba do ciljne tezine."
      onPrimaryPress={goNext}
      primaryLabel="Izracunaj plan"
      showBack={false}
      showHeader={false}
      showProgress={false}
      step={1}
      title="Proteinska Dijeta"
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
          <Ionicons color="#FFF7ED" name="flame" size={36} />
        </LinearGradient>

        <View className="items-center gap-3">
          <Text className="text-center text-4xl font-black text-text">
            Proteinska Dijeta
          </Text>
          <Text className="text-center text-sm font-bold uppercase tracking-[1.5px] text-warning">
            Protein Sparing Modified Fast
          </Text>
          <Text className="max-w-[320px] text-center text-base leading-7 text-muted">
            Brz, disciplinovan pristup skidanju masnoce uz fokus na ocuvanje misica.
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
        description="Ovo je strog protokol. Ako imas hronicne tegobe ili koristis terapiju, posavetuj se sa lekarom pre pocetka."
        title="Vazno"
        tone="warning"
      />
    </OnboardingStepScreen>
  );
}
