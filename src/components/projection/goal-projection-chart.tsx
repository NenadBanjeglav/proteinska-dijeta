import { useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/src/constants/colors";
import { cn } from "@/src/lib/cn";
import { formatProjectionDate, type GoalProjectionPoint } from "@/src/lib/projection";

type GoalProjectionChartProps = {
  points: GoalProjectionPoint[];
  width: number;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

type ChartMilestone = {
  key: string;
  eyebrow: string;
  value: string;
};

function buildMilestones(points: GoalProjectionPoint[]): ChartMilestone[] {
  if (points.length === 0) {
    return [];
  }

  const first = points[0];
  const last = points[points.length - 1];
  const middle = points[Math.floor((points.length - 1) / 2)];
  const milestones: ChartMilestone[] = [
    {
      key: `start-${first.day}`,
      eyebrow: "Pocetak",
      value: "Danas",
    },
  ];

  if (middle && middle.day !== first.day && middle.day !== last.day) {
    milestones.push({
      key: `middle-${middle.day}`,
      eyebrow: "Sredina",
      value: formatProjectionDate(middle.date),
    });
  }

  milestones.push({
    key: `goal-${last.day}`,
    eyebrow: "Cilj",
    value: formatProjectionDate(last.date),
  });

  return milestones;
}

export function GoalProjectionChart({
  points,
  width,
}: GoalProjectionChartProps) {
  const chartWidth = Math.max(220, width);
  const chartHeight = 180;
  const paddingX = 8;
  const paddingY = 18;
  const baselineY = chartHeight - paddingY;
  const reveal = useSharedValue(0);

  const chart = useMemo(() => {
    if (points.length < 2) {
      return null;
    }

    const weights = points.map((entry) => entry.weightKg);
    const maxDay = Math.max(...points.map((entry) => entry.day), 1);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = Math.max(0.8, max - min);
    const scaledPoints = points.map((entry) => {
      const x = paddingX + (entry.day / maxDay) * (chartWidth - paddingX * 2);
      const y =
        baselineY - ((entry.weightKg - min) / range) * (chartHeight - paddingY * 2 - 20);

      return {
        ...entry,
        x,
        y,
      };
    });

    const linePath = scaledPoints
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
    const areaPath = `${linePath} L ${scaledPoints[scaledPoints.length - 1]?.x} ${baselineY} L ${
      scaledPoints[0]?.x
    } ${baselineY} Z`;
    const lineLength = scaledPoints.reduce((total, point, index) => {
      if (index === 0) {
        return total;
      }

      const previous = scaledPoints[index - 1];
      return total + Math.hypot(point.x - previous.x, point.y - previous.y);
    }, 0);

    return {
      points: scaledPoints,
      linePath,
      areaPath,
      lineLength,
    };
  }, [baselineY, chartHeight, chartWidth, points]);

  useEffect(() => {
    reveal.value = 0;
    reveal.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [chart?.lineLength, reveal]);

  const lineAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: (chart?.lineLength ?? 0) * (1 - reveal.value),
  }));

  const chartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + reveal.value * 0.65,
    transform: [
      {
        translateY: (1 - reveal.value) * 12,
      },
    ],
  }));

  if (!chart) {
    return (
      <View className="rounded-3xl border border-dashed border-border px-5 py-10">
        <Text className="text-base leading-6 text-muted">
          Kad procena bude spremna, ovde ces videti putanju do ciljne tezine.
        </Text>
      </View>
    );
  }

  const milestones = buildMilestones(chart.points);

  return (
    <View className="gap-4">
      <Animated.View style={chartAnimatedStyle}>
        <Svg height={chartHeight} width={chartWidth}>
          <Defs>
            <LinearGradient id="goalProjectionFill" x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0%" stopColor="rgba(255, 122, 0, 0.34)" />
              <Stop offset="100%" stopColor="rgba(255, 122, 0, 0)" />
            </LinearGradient>
          </Defs>

          {[baselineY, chartHeight / 2, paddingY].map((lineY, index) => (
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

          <Path d={chart.areaPath} fill="url(#goalProjectionFill)" />
          <AnimatedPath
            animatedProps={lineAnimatedProps}
            d={chart.linePath}
            fill="none"
            stroke={colors.accentStart}
            strokeDasharray={`${chart.lineLength} ${chart.lineLength}`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
          />

          {chart.points.map((point, index) => {
            const isLast = index === chart.points.length - 1;

            return (
              <Circle
                key={`${point.date}-${point.day}`}
                cx={point.x}
                cy={point.y}
                fill={isLast ? colors.text : colors.accentStart}
                r={isLast ? 4.5 : 3}
                stroke={colors.accentStart}
                strokeWidth={isLast ? 2 : 0}
              />
            );
          })}
        </Svg>
      </Animated.View>

      <View className="flex-row items-start justify-between gap-3">
        {milestones.map((milestone, index) => {
          const isLast = index === milestones.length - 1;
          const isFirst = index === 0;

          return (
            <View
              key={milestone.key}
              className={cn(
                "flex-1 gap-1",
                isFirst && "items-start",
                !isFirst && !isLast && "items-center",
                isLast && "items-end",
              )}
            >
              <Text className="text-[10px] font-semibold uppercase tracking-[1.6px] text-muted">
                {milestone.eyebrow}
              </Text>
              <Text
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-semibold",
                  isLast
                    ? "bg-surface-strong text-warning"
                    : "bg-surface-soft text-muted-strong",
                )}
                numberOfLines={1}
              >
                {milestone.value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
