import { Text, View } from "react-native";

import { ProgressBar } from "@/src/components/ui/progress-bar";
import { SectionHeader } from "@/src/components/ui/section-header";

type StepHeaderProps = {
  step: number;
  total: number;
  title: string;
  description: string;
  showProgress?: boolean;
};

export function StepHeader({
  step,
  total,
  title,
  description,
  showProgress = true,
}: StepHeaderProps) {
  return (
    <View className="gap-4">
      {showProgress ? (
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted">
              Korak {step} od {total}
            </Text>
            <Text className="text-sm text-muted">
              {Math.round((step / total) * 100)}%
            </Text>
          </View>
          <ProgressBar progress={step / total} />
        </View>
      ) : null}
      <SectionHeader description={description} title={title} />
    </View>
  );
}
