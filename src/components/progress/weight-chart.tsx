import { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";

import { formatProgressDate } from "@/src/lib/progress";
import type { WeightEntry } from "@/src/types/app";

type WeightChartProps = {
  entries: WeightEntry[];
  width: number;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

type ChartPoint = WeightEntry & {
  x: number;
  y: number;
};

function getVisibleLabelIndexes(length: number) {
  if (length <= 5) {
    return new Set(Array.from({ length }, (_, index) => index));
  }

  const interval = Math.ceil((length - 1) / 4);
  const indexes = new Set<number>([0, length - 1]);

  for (let index = 0; index < length; index += interval) {
    indexes.add(index);
  }

  return indexes;
}

export function WeightChart({
  entries,
  width,
  selectedDate,
  onSelectDate,
}: WeightChartProps) {
  const chartWidth = Math.max(220, width);
  const chartHeight = 180;
  const paddingX = 8;
  const paddingY = 16;
  const baselineY = chartHeight - paddingY;

  const points = useMemo<ChartPoint[]>(() => {
    if (!entries.length) {
      return [];
    }

    if (entries.length === 1) {
      return [
        {
          ...entries[0],
          x: chartWidth / 2,
          y: chartHeight / 2,
        },
      ];
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

  const selectedPoint =
    points.find((point) => point.date === selectedDate) ?? points[points.length - 1] ?? null;

  if (!entries.length) {
    return (
      <View className="rounded-3xl border border-dashed border-border px-5 py-10">
        <Text className="text-base leading-6 text-muted">
          Grafik će se pojaviti čim sačuvaš prvo jutarnje merenje težine.
        </Text>
      </View>
    );
  }

  if (entries.length === 1) {
    const point = points[0];

    return (
      <View className="gap-4">
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
            strokeDasharray="6 6"
            strokeWidth={2}
            x1={point.x}
            x2={point.x}
            y1={paddingY + 12}
            y2={baselineY - 10}
          />
          <Circle cx={point.x} cy={point.y} fill="#FF7A00" r={7} />
          <Circle
            cx={point.x}
            cy={point.y}
            fill="transparent"
            r={15}
            stroke="rgba(255, 122, 0, 0.24)"
            strokeWidth={2}
          />
          <Circle
            cx={point.x}
            cy={point.y}
            fill="rgba(255,255,255,0.001)"
            onPress={() => onSelectDate(point.date)}
            r={18}
          />
        </Svg>

        <Text className="text-center text-sm leading-6 text-muted">
          Dodaj još jedno jutarnje merenje da bismo prikazali pravi trend, a ne samo jednu tačku.
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

        {selectedPoint ? (
          <Line
            stroke="rgba(248, 250, 252, 0.18)"
            strokeDasharray="6 6"
            strokeWidth={1.5}
            x1={selectedPoint.x}
            x2={selectedPoint.x}
            y1={paddingY}
            y2={baselineY}
          />
        ) : null}

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
          const isSelected = point.date === selectedPoint?.date;
          const isLast = index === points.length - 1;

          return (
            <Circle
              key={point.date}
              cx={point.x}
              cy={point.y}
              fill={isSelected || isLast ? "#F8FAFC" : "#FF7A00"}
              r={isSelected ? 5.5 : isLast ? 4.5 : 3}
              stroke="#FF7A00"
              strokeWidth={isSelected || isLast ? 2 : 0}
            />
          );
        })}

        {selectedPoint ? (
          <Circle
            cx={selectedPoint.x}
            cy={selectedPoint.y}
            fill="transparent"
            r={13}
            stroke="rgba(255, 122, 0, 0.22)"
            strokeWidth={3}
          />
        ) : null}

        {points.map((point) => (
          <Circle
            key={`${point.date}-hit`}
            cx={point.x}
            cy={point.y}
            fill="rgba(255,255,255,0.001)"
            onPress={() => onSelectDate(point.date)}
            r={16}
          />
        ))}
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
