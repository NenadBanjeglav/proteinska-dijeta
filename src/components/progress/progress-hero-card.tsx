import { Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { ProgressBar } from "@/src/components/ui/progress-bar";

type ProgressHeroCardProps = {
  totalLostLabel: string;
  elapsedLabel: string;
  currentWeightLabel: string;
  startingWeightLabel: string;
  progress: number;
  progressPercentLabel: string;
  progressTitle: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
  compact?: boolean;
  footerStack?: boolean;
};

export function ProgressHeroCard({
  totalLostLabel,
  elapsedLabel,
  currentWeightLabel,
  startingWeightLabel,
  progress,
  progressPercentLabel,
  progressTitle,
  footerLeft,
  footerCenter,
  footerRight,
  compact = false,
  footerStack = false,
}: ProgressHeroCardProps) {
  return (
    <Card className="gap-5 border-warning/40 bg-surface-strong">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
            Ukupno izgubljeno
          </Text>
          <Text
            className={compact ? "text-4xl font-black text-text" : "text-5xl font-black text-text"}
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {totalLostLabel}
          </Text>
          <Text className="text-sm font-semibold text-success">{elapsedLabel}</Text>
        </View>

        <View className="items-end gap-1">
          <Text className="text-sm text-muted">Trenutno</Text>
          <Text
            className={compact ? "text-2xl font-black text-text" : "text-3xl font-black text-text"}
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {currentWeightLabel}
          </Text>
          <Text className="text-sm text-muted">Pocetak: {startingWeightLabel}</Text>
        </View>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-sm font-semibold text-muted-strong">{progressTitle}</Text>
          <Text
            className="text-xl font-black text-warning"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {progressPercentLabel}
          </Text>
        </View>
        <ProgressBar progress={progress} />
        <View
          className={
            footerStack
              ? "gap-1"
              : "flex-row items-center justify-between gap-3"
          }
        >
          <Text className="text-sm text-muted">{footerLeft}</Text>
          <Text className="text-sm font-semibold text-warning">{footerCenter}</Text>
          <Text className="text-sm text-muted">{footerRight}</Text>
        </View>
      </View>
    </Card>
  );
}
