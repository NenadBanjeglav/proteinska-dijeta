import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "@/src/constants/colors";
import { cn } from "@/src/lib/cn";

type PrimaryButtonVariant = "primary" | "secondary" | "ghost";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: PrimaryButtonVariant;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}: PrimaryButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable disabled={isInactive} onPress={onPress}>
      {variant === "primary" ? (
        <LinearGradient
          colors={[colors.accentStart, colors.accentEnd]}
          end={{ x: 1, y: 0.5 }}
          start={{ x: 0, y: 0.5 }}
          style={{
            opacity: isInactive ? 0.5 : 1,
            borderRadius: 20,
            minHeight: 62,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text className="text-[17px] font-extrabold text-text">{label}</Text>
          )}
        </LinearGradient>
      ) : (
        <View
          className={cn(
            "min-h-[60px] items-center justify-center rounded-3xl border px-6",
            variant === "secondary"
              ? "border-border bg-surface"
              : "border-transparent bg-transparent",
            isInactive && "opacity-50",
          )}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text
              className={cn(
                "text-base font-semibold",
                variant === "ghost" ? "text-muted-strong" : "text-text",
              )}
            >
              {label}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}
