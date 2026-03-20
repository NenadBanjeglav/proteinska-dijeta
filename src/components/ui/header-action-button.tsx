import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { cn } from "@/src/lib/cn";
import { triggerHaptic } from "@/src/lib/haptics";

type HeaderActionButtonVariant = "default" | "accent";

type HeaderActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
  variant?: HeaderActionButtonVariant;
};

const WRAP_STYLES: Record<HeaderActionButtonVariant, string> = {
  default: "border-border bg-surface",
  accent: "border-warning/30 bg-surface-strong",
};

const ICON_COLORS: Record<HeaderActionButtonVariant, string> = {
  default: "#CBD5E1",
  accent: "#FDB022",
};

export function HeaderActionButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = "default",
}: HeaderActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={cn(
        "h-12 w-12 items-center justify-center rounded-2xl border",
        WRAP_STYLES[variant],
      )}
      onPress={() => {
        triggerHaptic("selection");
        onPress();
      }}
    >
      <Ionicons color={ICON_COLORS[variant]} name={icon} size={20} />
    </Pressable>
  );
}
