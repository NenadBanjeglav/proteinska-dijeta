import type { PropsWithChildren } from "react";
import { View } from "react-native";

import { cn } from "@/src/lib/cn";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ children, className }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-3xl border border-border bg-surface px-5 py-5",
        className,
      )}
    >
      {children}
    </View>
  );
}
