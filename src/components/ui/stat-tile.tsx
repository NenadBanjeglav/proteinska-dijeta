import { Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";

type StatTileProps = {
  label: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
};

export function StatTile({
  label,
  value,
  subtitle,
  accent = false,
}: StatTileProps) {
  return (
    <Card className={accent ? "border-warning bg-surface-strong" : undefined}>
      <View className="gap-2">
        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted">
          {label}
        </Text>
        <Text
          className="text-4xl font-black text-text"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {value}
        </Text>
        {subtitle ? (
          <Text className="text-sm leading-5 text-muted">{subtitle}</Text>
        ) : null}
      </View>
    </Card>
  );
}
