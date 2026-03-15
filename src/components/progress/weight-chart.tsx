import { useMemo } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

import type { WeightEntry } from "@/src/types/app";

type WeightChartProps = {
  entries: WeightEntry[];
};

export function WeightChart({ entries }: WeightChartProps) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(240, width - 80);
  const chartHeight = 180;
  const padding = 18;

  const points = useMemo(() => {
    if (!entries.length) {
      return [];
    }

    const weights = entries.map((entry) => entry.kg);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = Math.max(1, max - min);

    return entries.map((entry, index) => {
      const x =
        entries.length === 1
          ? chartWidth / 2
          : padding + (index / (entries.length - 1)) * (chartWidth - padding * 2);
      const y =
        chartHeight -
        padding -
        ((entry.kg - min) / range) * (chartHeight - padding * 2);

      return { ...entry, x, y };
    });
  }, [chartHeight, chartWidth, entries, padding]);

  if (!entries.length) {
    return (
      <View className="rounded-3xl border border-dashed border-border px-5 py-8">
        <Text className="text-base leading-6 text-muted">
          Grafik će se pojaviti kada budeš imao barem jedan unos težine.
        </Text>
      </View>
    );
  }

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <View className="gap-3">
      <Svg height={chartHeight} width={chartWidth}>
        <Line
          stroke="rgba(148, 163, 184, 0.24)"
          strokeWidth={1}
          x1={padding}
          x2={chartWidth - padding}
          y1={chartHeight - padding}
          y2={chartHeight - padding}
        />
        <Path
          d={line}
          fill="none"
          stroke="#FF7A00"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        />
        {points.map((point) => (
          <Circle
            key={point.date}
            cx={point.x}
            cy={point.y}
            fill="#FF2D20"
            r={4}
          />
        ))}
      </Svg>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-muted">{entries[0]?.date}</Text>
        <Text className="text-sm text-muted">{entries[entries.length - 1]?.date}</Text>
      </View>
    </View>
  );
}
