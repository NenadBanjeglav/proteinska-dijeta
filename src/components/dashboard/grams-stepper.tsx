import { Text, View } from "react-native";

import { ActionPill } from "@/src/components/dashboard/action-pill";
import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/cn";

type GramsStepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  fineStep?: number;
  coarseStep?: number;
  min?: number;
  max?: number;
  compact?: boolean;
};

export function GramsStepper({
  label,
  value,
  onChange,
  fineStep = 10,
  coarseStep = 50,
  min = 10,
  max = 1000,
  compact = false,
}: GramsStepperProps) {
  function update(nextValue: number) {
    const clamped = Math.min(max, Math.max(min, nextValue));
    onChange(clamped);
  }

  return (
    <Card className={cn("gap-3 px-4 py-4", compact && "gap-2 px-3 py-3")}>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-sm font-semibold uppercase tracking-[1.8px] text-muted">
          {label}
        </Text>
        <Text
          className="text-2xl font-black text-text"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {value}g
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <ActionPill label={`-${coarseStep}`} onPress={() => update(value - coarseStep)} />
        <ActionPill label={`-${fineStep}`} onPress={() => update(value - fineStep)} />
        <ActionPill
          label={`+${fineStep}`}
          onPress={() => update(value + fineStep)}
          variant="accent"
        />
        <ActionPill
          label={`+${coarseStep}`}
          onPress={() => update(value + coarseStep)}
          variant="accent"
        />
      </View>
    </Card>
  );
}
