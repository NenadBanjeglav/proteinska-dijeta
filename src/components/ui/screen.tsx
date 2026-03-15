import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";

import { cn } from "@/src/lib/cn";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  safeArea?: "none" | "top" | "all";
  contentClassName?: string;
}>;

export function Screen({
  children,
  scroll = true,
  padded = true,
  safeArea = "all",
  contentClassName,
}: ScreenProps) {
  const edges: Edge[] =
    safeArea === "all" ? ["top", "bottom"] : safeArea === "top" ? ["top"] : [];
  const contentClasses = cn(
    "flex-1 gap-6 bg-background",
    padded && "px-6 py-6",
    contentClassName,
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={edges}>
      {scroll ? (
        <ScrollView
          className="flex-1 bg-background"
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          <View className={contentClasses}>{children}</View>
        </ScrollView>
      ) : (
        <View className={contentClasses}>{children}</View>
      )}
    </SafeAreaView>
  );
}
