import { Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/cn";

type ProgressStatTone = "blue" | "orange" | "green" | "purple";

type ProgressStatCardProps = {
  label: string;
  value: string;
  subtitle: string;
  tone: ProgressStatTone;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

const CARD_STYLES: Record<ProgressStatTone, string> = {
  blue: "border-[#274B8E] bg-[#101B33]",
  orange: "border-[#6E3612] bg-[#24160F]",
  green: "border-[#17603C] bg-[#0E241A]",
  purple: "border-[#5A2D88] bg-[#241230]",
};

export function ProgressStatCard({
  label,
  value,
  subtitle,
  tone,
  compact = false,
  style,
}: ProgressStatCardProps) {
  return (
    <Card
      className={cn(
        compact ? "min-h-[132px] gap-3 px-4 py-4" : "min-h-[144px] gap-3",
        CARD_STYLES[tone],
      )}
      style={style}
    >
      <Text
        className="text-xs font-semibold uppercase tracking-[1.8px] text-muted"
        numberOfLines={2}
      >
        {label}
      </Text>
      <View className="gap-2">
        <Text
          className={compact ? "text-[30px] font-black text-text" : "text-[34px] font-black text-text"}
          numberOfLines={2}
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {value}
        </Text>
        <Text
          className="text-sm leading-6 text-muted-strong"
          numberOfLines={compact ? 2 : 3}
        >
          {subtitle}
        </Text>
      </View>
    </Card>
  );
}
