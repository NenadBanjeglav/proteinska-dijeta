import { Text, View } from "react-native";

import { ActionPill } from "@/src/components/dashboard/action-pill";
import { Card } from "@/src/components/ui/card";
import type { ProteinTargetChangeBanner as ProteinTargetChangeBannerPayload } from "@/src/store/selectors";

type ProteinTargetChangeBannerProps = {
  payload: ProteinTargetChangeBannerPayload;
  onDismiss: () => void;
  onExplain: () => void;
};

export function ProteinTargetChangeBanner({
  payload,
  onDismiss,
  onExplain,
}: ProteinTargetChangeBannerProps) {
  return (
    <Card className="gap-3 border-warning/30 bg-surface">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
        Novi cilj proteina
      </Text>

      <View className="gap-1">
        <Text className="text-2xl font-black text-text">
          Danasnji cilj je {payload.currentProteinTargetG} g
        </Text>
        <Text className="text-sm leading-6 text-muted">
          Jutarnja tezina te je prebacila u {payload.currentCategoryLabel}. Juce{" "}
          {payload.previousProteinTargetG} g, danas {payload.currentProteinTargetG} g.
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <ActionPill label="Zasto?" onPress={onExplain} variant="accent" />
        <ActionPill label="Skloni" onPress={onDismiss} variant="muted" />
      </View>
    </Card>
  );
}
