import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { colors } from "@/src/constants/colors";

type MacroRingProps = {
  progress: number;
  label: string;
  color?: string;
  size?: number;
};

export function MacroRing({
  progress,
  label,
  color = colors.accentEnd,
  size = 86,
}: MacroRingProps) {
  const safeProgress = Math.min(1, Math.max(0, progress));
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - safeProgress);

  return (
    <View
      className="items-center justify-center"
      style={{ height: size, width: size }}
    >
      <Svg height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="rgba(148, 163, 184, 0.16)"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          stroke={color}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </Svg>

      <View className="absolute inset-0 items-center justify-center">
        <Text
          className="text-xl font-black text-text"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
