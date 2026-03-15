import Slider from "@react-native-community/slider";
import { Text, View } from "react-native";

import { colors } from "@/src/constants/colors";

type BodyFatSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function BodyFatSlider({ value, onChange }: BodyFatSliderProps) {
  return (
    <View className="gap-4">
      <View className="items-center rounded-3xl bg-surface-soft px-6 py-6">
        <Text
          className="text-6xl font-black text-text"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {Math.round(value)}
          <Text className="text-4xl font-black text-muted-strong">%</Text>
        </Text>
        <Text className="mt-2 text-base text-muted">telesnih masti</Text>
      </View>

      <Slider
        maximumTrackTintColor="#2B3040"
        maximumValue={55}
        minimumTrackTintColor={colors.text}
        minimumValue={5}
        onValueChange={onChange}
        step={1}
        thumbTintColor={colors.text}
        value={value}
      />

      <View className="flex-row justify-between">
        <Text className="text-sm text-muted">5% - veoma vitko</Text>
        <Text className="text-sm text-muted">55% - gojaznost</Text>
      </View>
    </View>
  );
}
