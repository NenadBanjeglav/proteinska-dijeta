import { Text, View } from "react-native";

import { BottomSheet } from "@/src/components/ui/bottom-sheet";
import { Card } from "@/src/components/ui/card";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import type { NextCategoryThreshold, ProtocolContext } from "@/src/store/selectors";

type ProteinTargetExplanationSheetProps = {
  currentContext: ProtocolContext | null;
  nextThreshold: NextCategoryThreshold | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="gap-1">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
        {label}
      </Text>
      <Text className="text-2xl font-black text-text">{value}</Text>
      {hint ? <Text className="text-sm leading-6 text-muted">{hint}</Text> : null}
    </Card>
  );
}

export function ProteinTargetExplanationSheet({
  currentContext,
  nextThreshold,
  open,
  onOpenChange,
}: ProteinTargetExplanationSheetProps) {
  return (
    <BottomSheet
      onOpenChange={onOpenChange}
      open={open}
      title="Kako računamo današnji cilj"
    >
      <View className="gap-4">
        <Card className="gap-2">
          <Text className="text-sm leading-6 text-muted">
            Cilj se računa po poslednjoj sačuvanoj jutarnjoj težini, uz istu
            procenjenu nemasnu masu iz onboardinga. Zato se broj menja kako mršaviš.
          </Text>
        </Card>

        <MetricCard
          hint="Procena iz trenutne jutarnje težine i fiksne nemasne mase."
          label="Procena BF"
          value={
            currentContext ? `~${currentContext.estimatedBodyFatPct.toFixed(1)}%` : "Nedostupno"
          }
        />

        <MetricCard
          label="Trenutna kategorija"
          value={currentContext?.categoryLabel ?? "Nedostupno"}
        />

        <MetricCard
          hint={
            currentContext
              ? `Procena kalorija oko ${currentContext.calorieTarget} kcal`
              : undefined
          }
          label="Današnji cilj proteina"
          value={currentContext ? `${currentContext.proteinTargetG} g` : "Nedostupno"}
        />

        <Card className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
            Sledeća veća promena
          </Text>
          <Text className="text-base leading-7 text-text">
            {nextThreshold
              ? `Oko ${nextThreshold.weightKg.toFixed(1)} kg ulaziš u ${nextThreshold.targetCategoryLabel}.`
              : "Sada si u Kategoriji 1, pa se cilj dalje menja postepeno sa svakom promenom težine."}
          </Text>
          <Text className="text-sm leading-6 text-muted">
            {nextThreshold
              ? `Tada procena pada na oko ${nextThreshold.bodyFatPct}% BF i menja se opseg proteina.`
              : "Nema sledeće oštre granice, samo postepeno prilagođavanje."}
          </Text>
        </Card>

        <PrimaryButton
          haptic="none"
          label="Zatvori"
          onPress={() => onOpenChange(false)}
          variant="ghost"
        />
      </View>
    </BottomSheet>
  );
}
