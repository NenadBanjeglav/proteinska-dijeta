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
      title="Kako racunamo danasnji cilj"
    >
      <View className="gap-4">
        <Card className="gap-2">
          <Text className="text-sm leading-6 text-muted">
            Cilj se racuna po poslednjoj sacuvanoj jutarnjoj tezini, uz istu procenjenu
            nemasnu masu iz onbordinga. Zato se broj menja kako mrsavis.
          </Text>
        </Card>

        <MetricCard
          hint="Procena iz trenutne jutarnje tezine i fiksne nemasne mase."
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
          label="Danasnji cilj proteina"
          value={currentContext ? `${currentContext.proteinTargetG} g` : "Nedostupno"}
        />

        <Card className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
            Sledeca veca promena
          </Text>
          <Text className="text-base leading-7 text-text">
            {nextThreshold
              ? `Oko ${nextThreshold.weightKg.toFixed(1)} kg ulazis u ${nextThreshold.targetCategoryLabel}.`
              : "Sada si u Kategoriji 1, pa se cilj dalje menja postepeno sa svakom promenom tezine."}
          </Text>
          <Text className="text-sm leading-6 text-muted">
            {nextThreshold
              ? `Tada procena pada na oko ${nextThreshold.bodyFatPct}% BF i menja se opseg proteina.`
              : "Nema sledece ostre granice, samo postepeno prilagodjavanje."}
          </Text>
        </Card>

        <PrimaryButton
          label="Zatvori"
          onPress={() => onOpenChange(false)}
          variant="ghost"
        />
      </View>
    </BottomSheet>
  );
}
