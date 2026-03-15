import { Pressable, Text, View } from "react-native";

import { cn } from "@/src/lib/cn";
import type { ChartPeriod } from "@/src/lib/progress";

type ProgressPeriodToggleProps = {
  value: ChartPeriod;
  onChange: (value: ChartPeriod) => void;
};

const OPTIONS: { label: string; value: ChartPeriod }[] = [
  { label: "Nedelja", value: "week" },
  { label: "Sve", value: "all" },
];

export function ProgressPeriodToggle({
  value,
  onChange,
}: ProgressPeriodToggleProps) {
  return (
    <View className="self-start rounded-2xl bg-surface-soft p-1">
      <View className="flex-row gap-1">
        {OPTIONS.map((option) => {
          const active = option.value === value;

          return (
            <Pressable
              key={option.value}
              className={cn(
                "min-w-[78px] rounded-2xl px-4 py-2.5",
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
