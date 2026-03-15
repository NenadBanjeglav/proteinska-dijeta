import { Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { MacroRing } from "@/src/components/dashboard/macro-ring";
import { cn } from "@/src/lib/cn";

type ProgressMetricCardTone = "protein" | "calories";

type ProgressMetricCardProps = {
  title: string;
  progress: number;
  valueLabel: string;
  targetLabel: string;
  percentLabel: string;
  tone: ProgressMetricCardTone;
};

const CARD_STYLES: Record<ProgressMetricCardTone, string> = {
  protein: "border-[#5A2F1B] bg-[#201511]",
  calories: "border-[#562734] bg-[#19121B]",
};

const TITLE_STYLES: Record<ProgressMetricCardTone, string> = {
  protein: "text-warning",
  calories: "text-danger",
};

const RING_COLORS: Record<ProgressMetricCardTone, string> = {
  protein: "#FF7A00",
  calories: "#FF4D5A",
};

export function ProgressMetricCard({
  title,
  progress,
  valueLabel,
  targetLabel,
  percentLabel,
  tone,
}: ProgressMetricCardProps) {
  return (
    <Card className={cn("flex-1 items-center gap-4 px-4 py-4", CARD_STYLES[tone])}>
      <View className="w-full flex-row items-center justify-between">
        <Text className={cn("text-xs font-semibold uppercase tracking-[1.8px]", TITLE_STYLES[tone])}>
          {title}
        </Text>
        <View
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            tone === "protein" ? "bg-warning" : "bg-danger",
          )}
        />
      </View>

      <MacroRing color={RING_COLORS[tone]} label={percentLabel} progress={progress} />

      <View className="items-center gap-1">
        <Text
          className="text-3xl font-black text-text"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {valueLabel}
        </Text>
        <Text className="text-sm text-muted">{targetLabel}</Text>
      </View>
    </Card>
  );
}
