import { Pressable, Text } from "react-native";

import { cn } from "@/src/lib/cn";

type ActionPillVariant = "accent" | "muted" | "danger";

type ActionPillProps = {
  label: string;
  onPress: () => void;
  variant?: ActionPillVariant;
  disabled?: boolean;
};

const WRAPPER_STYLES: Record<ActionPillVariant, string> = {
  accent: "bg-accent",
  muted: "bg-surface-soft",
  danger: "bg-danger/15",
};

const TEXT_STYLES: Record<ActionPillVariant, string> = {
  accent: "text-text",
  muted: "text-muted-strong",
  danger: "text-danger",
};

export function ActionPill({
  label,
  onPress,
  variant = "muted",
  disabled = false,
}: ActionPillProps) {
  return (
    <Pressable
      className={cn(
        "min-h-[40px] min-w-[40px] items-center justify-center rounded-2xl px-4",
        WRAPPER_STYLES[variant],
        disabled && "opacity-40",
      )}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className={cn("text-sm font-bold", TEXT_STYLES[variant])}>{label}</Text>
    </Pressable>
  );
}
