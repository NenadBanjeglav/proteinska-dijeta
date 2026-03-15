import { Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { Chip } from "@/src/components/ui/chip";
import { cn } from "@/src/lib/cn";
import type { ProgressMilestoneTone } from "@/src/lib/progress";

type MilestoneCardProps = {
  badge: string;
  title: string;
  description: string;
  tone?: ProgressMilestoneTone;
};

const CARD_STYLES: Record<ProgressMilestoneTone, string> = {
  default: "border-border bg-surface",
  accent: "border-warning/30 bg-surface-strong",
  success: "border-success/30 bg-success/10",
};

const CHIP_VARIANTS: Record<ProgressMilestoneTone, "default" | "warning" | "success"> = {
  default: "default",
  accent: "warning",
  success: "success",
};

export function MilestoneCard({
  badge,
  title,
  description,
  tone = "default",
}: MilestoneCardProps) {
  return (
    <Card className={cn("gap-3", CARD_STYLES[tone])}>
      <Chip label={badge} variant={CHIP_VARIANTS[tone]} />
      <View className="gap-1">
        <Text className="text-lg font-bold text-text">{title}</Text>
        <Text className="text-sm leading-6 text-muted">{description}</Text>
      </View>
    </Card>
  );
}
