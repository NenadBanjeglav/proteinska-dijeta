import { Pressable, Text, View } from "react-native";

import { cn } from "@/src/lib/cn";
import type { ChartPeriod } from "@/src/lib/progress";

type ProgressPeriodToggleProps = {
  value: ChartPeriod;
  onChange: (value: ChartPeriod) => void;
};

const OPTIONS: { label: string; value: ChartPeriod }[] = [
  { label: "7 dana", value: "week" },
  { label: "30 dana", value: "month" },
  { label: "Sve", value: "all" },
];

export function ProgressPeriodToggle({
  value,
  onChange,
}: ProgressPeriodToggleProps) {
  return (
    <View
      accessibilityRole="radiogroup"
      className="self-start rounded-2xl bg-surface-soft p-1"
    >
      <View className="flex-row gap-1">
        {OPTIONS.map((option) => {
          const active = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Prikaži period ${option.label}`}
              className={cn(
                "min-w-[72px] rounded-2xl px-4 py-2.5",
                active ? "bg-accent" : "bg-transparent",
              )}
              onPress={() => onChange(option.value)}
            >
              <Text
                className={cn(
                  "text-center text-sm font-bold",
                  active ? "text-text" : "text-muted",
                )}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
