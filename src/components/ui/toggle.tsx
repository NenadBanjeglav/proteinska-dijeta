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
    <View className="flex-row rounded-2xl bg-surface-soft p-1">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            className={cn(
              "flex-1 rounded-2xl px-4 py-3",
              active ? "bg-accent" : "bg-transparent",
            )}
            onPress={() => onChange(option.value)}
          >
            <Text
              className={cn(
                "text-center text-sm font-semibold",
                active ? "text-text" : "text-muted",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
