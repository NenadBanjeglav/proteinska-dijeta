import type { PropsWithChildren } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { cn } from "@/src/lib/cn";

type CardProps = PropsWithChildren<{
  className?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ children, className, style }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-3xl border border-border bg-surface px-5 py-5",
        className,
      )}
      style={style}
    >
      {children}
    </View>
  );
}
