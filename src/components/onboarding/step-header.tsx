import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { SectionHeader } from "@/src/components/ui/section-header";

type StepHeaderProps = {
  progressStep: number;
  total: number;
  title: string;
  description: string;
  showProgress?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
  progressLabel?: string;
};

export function StepHeader({
  progressStep,
  total,
  title,
  description,
  showProgress = true,
  showBack = true,
  onBackPress,
  progressLabel,
}: StepHeaderProps) {
  return (
    <View className="gap-6">
      {showProgress ? (
        <View className="flex-row items-center gap-4">
          {showBack ? (
            <Pressable
              accessibilityLabel="Nazad"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full"
              onPress={onBackPress}
            >
              <Ionicons color="#CBD5E1" name="arrow-back" size={20} />
            </Pressable>
          ) : (
            <View className="h-9 w-9" />
          )}

          <View className="flex-1 gap-2">
            <View className="h-1.5 overflow-hidden rounded-full bg-surface-soft">
              <View
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.min(100, (progressStep / total) * 100)}%` }}
              />
            </View>
          </View>
          <Text className="text-sm text-muted">
            {progressLabel ?? `${progressStep} od ${total}`}
          </Text>
        </View>
      ) : null}
      <SectionHeader description={description} title={title} />
    </View>
  );
}
