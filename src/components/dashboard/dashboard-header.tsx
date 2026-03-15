import { Pressable, Text, View } from "react-native";

import { ProgressBar } from "@/src/components/ui/progress-bar";

type DashboardHeaderProps = {
  dayLabel: string;
  title: string;
  remainingLabel: string;
  progress: number;
  onPlanPress: () => void;
};

export function DashboardHeader({
  dayLabel,
  title,
  remainingLabel,
  progress,
  onPlanPress,
}: DashboardHeaderProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted">
            {dayLabel}
          </Text>
          <Text className="text-[34px] font-black leading-10 text-text">{title}</Text>
        </View>

        <Pressable
          className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-strong"
          onPress={onPlanPress}
        >
          <Text className="text-xs font-bold uppercase tracking-[1px] text-warning">
            Plan
          </Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <ProgressBar progress={progress} />
        </View>
        <Text className="text-sm text-muted">{remainingLabel}</Text>
      </View>
    </View>
  );
}
