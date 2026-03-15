import { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";

import { formatProgressDate } from "@/src/lib/progress";
import type { WeightEntry } from "@/src/types/app";

type WeightChartProps = {
  entries: WeightEntry[];
  width: number;
};

function getVisibleLabelIndexes(length: number) {
  if (length <= 6) {
    return new Set(Array.from({ length }, (_, index) => index));
  }

  const interval = Math.ceil((length - 1) / 5);
  const indexes = new Set<number>([0, length - 1]);

  for (let index = 0; index < length; index += interval) {
    indexes.add(index);
  }

  return indexes;
}

export function WeightChart({ entries, width }: WeightChartProps) {
  const chartWidth = Math.max(220, width);
  const chartHeight = 180;
  const paddingX = 8;
  const paddingY = 16;
  const baselineY = chartHeight - paddingY;

  const points = useMemo(() => {
    if (entries.length < 2) {
      return [];
    }

    const weights = entries.map((entry) => entry.kg);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = Math.max(0.6, max - min);

    return entries.map((entry, index) => {
      const x = paddingX + (index / (entries.length - 1)) * (chartWidth - paddingX * 2);
      const y =
        baselineY - ((entry.kg - min) / range) * (chartHeight - paddingY * 2 - 18);

      return { ...entry, x, y };
    });
  }, [baselineY, chartHeight, chartWidth, entries, paddingX, paddingY]);

  if (!entries.length) {
    return (
      <View className="rounded-3xl border border-dashed border-border px-5 py-10">
        <Text className="text-base leading-6 text-muted">
          Grafik ce se pojaviti cim sacuvas prvi jutarnji unos tezine.
        </Text>
      </View>
    );
  }

  if (entries.length === 1) {
    const entry = entries[0];
    const centerX = chartWidth / 2;
    const pointY = chartHeight / 2;

    return (
      <View className="gap-4">
        <View className="items-center gap-1">
          <Text
            className="text-3xl font-black text-text"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {entry.kg} kg
          </Text>
          <Text className="text-sm text-muted">{formatProgressDate(entry.date)}</Text>
        </View>

        <Svg height={chartHeight} width={chartWidth}>
          <Line
            stroke="rgba(148, 163, 184, 0.16)"
            strokeWidth={1}
            x1={paddingX}
            x2={chartWidth - paddingX}
            y1={baselineY}
            y2={baselineY}
          />
          <Line
            stroke="rgba(255, 122, 0, 0.22)"
            strokeWidth={2}
            x1={centerX}
            x2={centerX}
            y1={paddingY + 12}
            y2={baselineY - 10}
          />
          <Circle cx={centerX} cy={pointY} fill="#FF7A00" r={7} />
          <Circle
            cx={centerX}
            cy={pointY}
            fill="transparent"
            r={14}
            stroke="rgba(255, 122, 0, 0.24)"
            strokeWidth={2}
          />
        </Svg>

        <Text className="text-center text-sm leading-6 text-muted">
          Treba jos jedan jutarnji unos da bismo prikazali pravi trend, a ne samo referentnu tacku.
        </Text>
      </View>
    );
  }

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x} ${baselineY} L ${
    points[0]?.x
  } ${baselineY} Z`;
  const labelIndexes = getVisibleLabelIndexes(points.length);
  const guideLines = [baselineY, chartHeight / 2, paddingY];

  return (
    <View className="gap-4">
      <Svg height={chartHeight} width={chartWidth}>
        <Defs>
          <LinearGradient id="progressFill" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0%" stopColor="rgba(255, 122, 0, 0.28)" />
            <Stop offset="100%" stopColor="rgba(255, 122, 0, 0)" />
          </LinearGradient>
        </Defs>

        {guideLines.map((lineY, index) => (
          <Line
            key={index}
            stroke="rgba(148, 163, 184, 0.16)"
            strokeWidth={1}
            x1={paddingX}
            x2={chartWidth - paddingX}
            y1={lineY}
            y2={lineY}
          />
        ))}

        <Path d={areaPath} fill="url(#progressFill)" />
        <Path
          d={linePath}
          fill="none"
          stroke="#FF7A00"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        />

        {points.map((point, index) => {
          const isLast = index === points.length - 1;

          return (
            <Circle
              key={point.date}
              cx={point.x}
              cy={point.y}
              fill={isLast ? "#F8FAFC" : "#FF7A00"}
              r={isLast ? 4.5 : 3}
              stroke="#FF7A00"
              strokeWidth={isLast ? 2 : 0}
            />
          );
        })}
      </Svg>

      <View className="flex-row items-center">
        {points.map((point, index) => {
          const visible = labelIndexes.has(index);

          return (
            <View key={point.date} className="flex-1 items-center">
              <Text
                className={`text-xs ${visible ? "text-muted" : "text-transparent"}`}
                numberOfLines={1}
              >
                {visible ? formatProgressDate(point.date) : "00. mes"}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
