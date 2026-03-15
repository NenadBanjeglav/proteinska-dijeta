import { Text, View } from "react-native";

type ProgressBarProps = {
  progress: number;
  label?: string;
};

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const safeProgress = Math.min(1, Math.max(0, progress));

  return (
    <View className="gap-2">
      {label ? <Text className="text-sm text-muted">{label}</Text> : null}
      <View className="h-2 overflow-hidden rounded-full bg-surface-soft">
        <View
          className="h-full rounded-full bg-accent"
          style={{ width: `${safeProgress * 100}%` }}
        />
      </View>
    </View>
  );
}
