import { Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";

type WaterTrackerCardProps = {
  targetLiters: number;
  weightKg: number;
};

function formatDecimal(value: number) {
  const normalized = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
  return normalized.replace(".", ",");
}

export function WaterTrackerCard({
  targetLiters,
  weightKg,
}: WaterTrackerCardProps) {
  const litersLabel = formatDecimal(targetLiters);
  const weightLabel = formatDecimal(weightKg);

  return (
    <Card className="gap-4 px-4 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-lg font-bold text-text">Unos vode</Text>
          <Text className="text-sm text-muted-strong">
            Preporuka na osnovu 35 ml/kg
          </Text>
        </View>

        <View className="rounded-full bg-[#4D9BFF]/15 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-[#7CB9FF]">
            Vodič
          </Text>
        </View>
      </View>

      <View className="gap-1">
        <Text
          className="text-3xl font-black text-text"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {litersLabel} L dnevno
        </Text>
        <Text className="text-sm text-muted">35 ml/kg × {weightLabel} kg</Text>
      </View>

      <View className="rounded-3xl bg-surface-soft px-4 py-3">
        <Text className="text-sm leading-6 text-muted">
          Povećaj unos ako treniraš, znojiš se ili je vruće. So i elektroliti i
          dalje su bitni tokom dijete.
        </Text>
      </View>
    </Card>
  );
}
