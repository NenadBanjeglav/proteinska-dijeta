import { Text } from "react-native";

import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/cn";

type InfoCalloutProps = {
  title?: string;
  description: string;
  tone?: "default" | "warning" | "success";
};

const TONE_CLASS = {
  default: "border-border bg-surface",
  warning: "border-warning bg-surface-strong",
  success: "border-success bg-surface-soft",
} as const;

const TITLE_CLASS = {
  default: "text-muted-strong",
  warning: "text-warning",
  success: "text-success",
} as const;

export function InfoCallout({
  title,
  description,
  tone = "default",
}: InfoCalloutProps) {
  return (
    <Card className={cn("gap-2", TONE_CLASS[tone])}>
      {title ? (
        <Text
          className={cn(
            "text-sm font-semibold uppercase tracking-[2px]",
            TITLE_CLASS[tone],
          )}
        >
          {title}
        </Text>
      ) : null}
      <Text className="text-sm leading-6 text-muted-strong">{description}</Text>
    </Card>
  );
}
