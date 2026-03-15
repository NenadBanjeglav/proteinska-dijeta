import { Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  badge?: string;
};

export function EmptyState({ title, description, badge }: EmptyStateProps) {
  return (
    <Card className="gap-3">
      {badge ? (
        <View className="self-start rounded-full bg-surface-strong px-3 py-2">
          <Text className="text-xs font-semibold text-warning">{badge}</Text>
        </View>
      ) : null}
      <View className="gap-2">
        <Text className="text-xl font-bold text-text">{title}</Text>
        <Text className="text-base leading-6 text-muted">{description}</Text>
      </View>
    </Card>
  );
}
