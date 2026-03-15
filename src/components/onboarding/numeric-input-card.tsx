import { Text, TextInput, View } from "react-native";

import { Card } from "@/src/components/ui/card";

type NumericInputCardProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  suffix?: string;
  helpText?: string;
  align?: "left" | "center";
  large?: boolean;
};

export function NumericInputCard({
  label,
  value,
  onChangeText,
  placeholder,
  suffix,
  helpText,
  align = "center",
  large = true,
}: NumericInputCardProps) {
  return (
    <Card className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted">
        {label}
      </Text>
      <View
        className="flex-row items-center gap-3 rounded-3xl bg-surface-soft px-5 py-4"
      >
        <TextInput
          className={
            align === "center"
              ? "flex-1 text-center text-text"
              : "flex-1 text-left text-text"
          }
          keyboardType="decimal-pad"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          value={value}
          style={{
            fontSize: large ? 52 : 26,
            fontWeight: "900",
          }}
        />
        {suffix ? (
          <Text className="text-lg font-semibold text-muted-strong">{suffix}</Text>
        ) : null}
      </View>
      {helpText ? <Text className="text-sm text-muted">{helpText}</Text> : null}
    </Card>
  );
}
