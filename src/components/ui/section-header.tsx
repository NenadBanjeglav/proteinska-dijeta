import { Text, View } from "react-native";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <View className="gap-2">
      {eyebrow ? (
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-warning">
          {eyebrow}
        </Text>
      ) : null}
      <Text className="text-3xl font-bold leading-9 text-text">{title}</Text>
      {description ? (
        <Text className="text-base leading-6 text-muted">{description}</Text>
      ) : null}
    </View>
  );
}
