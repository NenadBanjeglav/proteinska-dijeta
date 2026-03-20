import { Pressable, Text, View } from "react-native";

import { cn } from "@/src/lib/cn";

type ToggleOption<T extends string> = {
  label: string;
  value: T;
};

type ToggleProps<T extends string> = {
  value: T;
  options: ToggleOption<T>[];
  onChange: (value: T) => void;
};

export function Toggle<T extends string>({
  value,
  options,
  onChange,
}: ToggleProps<T>) {
  return (
    <View className="w-full max-w-[340px] self-center overflow-hidden rounded-full border border-border bg-surface-soft p-1">
      <View className="flex-row gap-1">
        {options.map((option) => {
          const active = option.value === value;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              key={option.value}
              className={cn(
                "min-h-[52px] flex-1 items-center justify-center rounded-full px-4",
                active ? "bg-accent" : "bg-transparent",
              )}
              onPress={() => onChange(option.value)}
            >
              <Text
                adjustsFontSizeToFit
                className={cn(
                  "text-center text-[13px] font-bold",
                  active ? "text-text" : "text-muted-strong",
                )}
                minimumFontScale={0.85}
                numberOfLines={1}
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
