import { Text, View } from "react-native";

import { ActionPill } from "@/src/components/dashboard/action-pill";
import { Card } from "@/src/components/ui/card";

type WaterTrackerCardProps = {
  currentGlasses: number;
  targetGlasses: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function WaterTrackerCard({
  currentGlasses,
  targetGlasses,
  onDecrease,
  onIncrease,
}: WaterTrackerCardProps) {
  const safeTarget = Math.max(1, targetGlasses);
  const progress = Math.min(1, currentGlasses / safeTarget);
  const currentMl = currentGlasses * 250;

  return (
    <Card className="gap-4 px-4 py-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-lg font-bold text-text">Voda</Text>
          <Text className="text-sm text-muted-strong">
            {currentGlasses} / {safeTarget} casa - {currentMl} ml
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <ActionPill
            disabled={currentGlasses <= 0}
            label="-"
            onPress={onDecrease}
          />
          <ActionPill label="+" onPress={onIncrease} variant="accent" />
        </View>
      </View>

      <View className="h-2 overflow-hidden rounded-full bg-surface-soft">
        <View
          className="h-full rounded-full bg-[#4D9BFF]"
          style={{ width: `${progress * 100}%` }}
        />
      </View>
    </Card>
  );
}
