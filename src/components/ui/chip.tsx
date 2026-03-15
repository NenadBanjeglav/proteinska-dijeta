import { Text, View } from "react-native";

import { cn } from "@/src/lib/cn";

type ChipVariant = "default" | "accent" | "warning" | "success";

type ChipProps = {
  label: string;
  variant?: ChipVariant;
  className?: string;
};

const STYLES: Record<ChipVariant, string> = {
  default: "border-border bg-surface-soft",
  accent: "border-transparent bg-surface-strong",
  warning: "border-transparent bg-surface-strong",
  success: "border-transparent bg-surface-soft",
};

const TEXT_STYLES: Record<ChipVariant, string> = {
  default: "text-muted-strong",
  accent: "text-warning",
  warning: "text-warning",
  success: "text-success",
};

export function Chip({ label, variant = "default", className }: ChipProps) {
  return (
    <View
      className={cn(
        "self-start rounded-full border px-3 py-2",
        STYLES[variant],
        className,
      )}
    >
      <Text className={cn("text-xs font-semibold", TEXT_STYLES[variant])}>
        {label}
      </Text>
    </View>
  );
}
