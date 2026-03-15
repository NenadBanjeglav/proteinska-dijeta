import { Text, View } from "react-native";

import { ProgressBar } from "@/src/components/ui/progress-bar";
import { HeaderActionButton } from "@/src/components/ui/header-action-button";

type DashboardHeaderProps = {
  dayLabel: string;
  title: string;
  remainingLabel: string;
  progress: number;
  onSettingsPress: () => void;
};

export function DashboardHeader({
  dayLabel,
  title,
  remainingLabel,
  progress,
  onSettingsPress,
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

        <View className="gap-2">
          <HeaderActionButton
            accessibilityLabel="Podesavanja"
            icon="settings-outline"
            onPress={onSettingsPress}
          />
        </View>
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
