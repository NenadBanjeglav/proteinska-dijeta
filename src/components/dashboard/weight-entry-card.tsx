import { Text, View } from "react-native";

import { ActionPill } from "@/src/components/dashboard/action-pill";
import { Card } from "@/src/components/ui/card";
import {
  formatWeightKg,
  getWeightDeltaLabel,
  getWeightDeltaTone,
} from "@/src/lib/dashboard";

type WeightEntryCardProps = {
  todayWeightKg: number | null;
  deltaKg: number | null;
  onPress: () => void;
};

export function WeightEntryCard({
  todayWeightKg,
  deltaKg,
  onPress,
}: WeightEntryCardProps) {
  const deltaTone = getWeightDeltaTone(deltaKg);

  return (
    <Card className="flex-row items-center justify-between gap-4 px-4 py-4">
      <View className="flex-row items-center gap-4">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#19335E]">
          <Text className="text-lg font-black text-[#6EA8FF]">KG</Text>
        </View>

        <View className="gap-1">
          <Text className="text-xl font-bold text-text">
            {todayWeightKg === null ? "Unesi danasnju tezinu" : "Danasnja tezina"}
          </Text>
          <Text
            className={
              deltaTone === "success"
                ? "text-sm text-success"
                : deltaTone === "danger"
                  ? "text-sm text-danger"
                  : "text-sm text-muted"
            }
          >
            {todayWeightKg === null ? "Nije uneseno" : getWeightDeltaLabel(deltaKg)}
          </Text>
        </View>
      </View>

      <View className="items-end gap-2">
        {todayWeightKg !== null ? (
          <Text
            className="text-2xl font-black text-text"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {formatWeightKg(todayWeightKg)}
          </Text>
        ) : null}
        <ActionPill
          label={todayWeightKg === null ? "+ Unesi" : "Izmeni"}
          onPress={onPress}
          variant="accent"
        />
      </View>
    </Card>
  );
}
