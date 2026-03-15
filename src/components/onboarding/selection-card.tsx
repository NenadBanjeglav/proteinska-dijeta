import { Pressable, Text, View } from "react-native";

import { Chip } from "@/src/components/ui/chip";
import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/cn";

type SelectionCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  meta?: string;
  badge?: string;
};

export function SelectionCard({
  title,
  description,
  selected,
  onPress,
  meta,
  badge,
}: SelectionCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card
        className={cn(
          "gap-3 px-4 py-4",
          selected && "border-warning bg-surface-strong",
        )}
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-2">
            <Text className="text-[18px] font-extrabold text-text">{title}</Text>
            <Text className="text-sm leading-5 text-muted">{description}</Text>
          </View>
          <View
            className={cn(
              "mt-1 h-5 w-5 rounded-full border-2",
              selected ? "border-warning bg-accent" : "border-muted bg-transparent",
            )}
          />
        </View>
        {meta ? <Text className="text-sm text-muted-strong">{meta}</Text> : null}
        {badge ? <Chip label={badge} variant="warning" /> : null}
      </Card>
    </Pressable>
  );
}
