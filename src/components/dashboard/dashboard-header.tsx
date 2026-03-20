import { Text, View } from "react-native";

import { HeaderActionButton } from "@/src/components/ui/header-action-button";
import { ProgressBar } from "@/src/components/ui/progress-bar";

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
          <Text className="text-[34px] font-black leading-10 text-text" numberOfLines={2}>
            {title}
          </Text>
        </View>

        <View className="gap-2">
          <HeaderActionButton
            accessibilityLabel="Podešavanja"
            icon="settings-outline"
            onPress={onSettingsPress}
          />
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <ProgressBar progress={progress} />
        </View>
        <Text className="shrink-0 text-sm text-muted" numberOfLines={1}>
          {remainingLabel}
        </Text>
      </View>
    </View>
  );
}
