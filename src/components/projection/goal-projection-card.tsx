import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GoalProjectionChart } from "@/src/components/projection/goal-projection-chart";
import { Card } from "@/src/components/ui/card";
import {
  formatProjectedDays,
  formatProjectionDate,
  type GoalProjection,
} from "@/src/lib/projection";
import { roundTo } from "@/src/lib/units";

type GoalProjectionCardProps = {
  projection: GoalProjection;
  eyebrow: string;
  title: string;
  description: string;
};

export function GoalProjectionCard({
  projection,
  eyebrow,
  title,
  description,
}: GoalProjectionCardProps) {
  const [chartWidth, setChartWidth] = useState(260);
  const entrance = useSharedValue(0);

  useEffect(() => {
    entrance.value = 0;
    entrance.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [entrance, projection.goalWeightKg, projection.projectedDays]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [
      {
        translateY: (1 - entrance.value) * 10,
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Card className="gap-4 border-warning/40 bg-surface-strong">
        <View className="gap-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            {eyebrow}
          </Text>
          <Text className="text-2xl font-black text-text">{title}</Text>
          <Text className="text-sm leading-6 text-muted">{description}</Text>
        </View>

        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-sm text-muted">Procena do cilja</Text>
            <Text
              className="text-4xl font-black text-text"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {formatProjectedDays(projection.projectedDays)}
            </Text>
            <Text className="text-sm font-semibold text-warning">
              {projection.projectedDays === 0
                ? "Cilj je već dostignut"
                : projection.projectedTargetDate
                ? `Do ${roundTo(projection.goalWeightKg, 1)} kg oko ${formatProjectionDate(
                    projection.projectedTargetDate,
                  )}`
                : `Cilj ${roundTo(projection.goalWeightKg, 1)} kg`}
            </Text>
          </View>

          <View className="items-end gap-1">
            <Text className="text-sm text-muted">Preostalo</Text>
            <Text
              className="text-3xl font-black text-text"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {roundTo(projection.remainingKg, 1)} kg
            </Text>
            {projection.projectedGoalBodyFatPct !== null ? (
              <Text className="text-sm text-muted">
                Cilj bf% ~{projection.projectedGoalBodyFatPct}
              </Text>
            ) : null}
          </View>
        </View>

        {projection.status === "invalid" ? (
          <View className="rounded-3xl border border-danger/40 bg-danger/10 px-4 py-4">
            <Text className="text-sm font-semibold uppercase tracking-[1.8px] text-danger">
              Procena nije validna
            </Text>
            <Text className="mt-2 text-sm leading-6 text-muted-strong">
              {projection.message}
            </Text>
          </View>
        ) : (
          <>
            <View
              onLayout={(event) => {
                const nextWidth = Math.max(
                  220,
                  Math.round(event.nativeEvent.layout.width),
                );
                if (Math.abs(nextWidth - chartWidth) > 1) {
                  setChartWidth(nextWidth);
                }
              }}
            >
              <GoalProjectionChart points={projection.chartPoints} width={chartWidth} />
            </View>

            <View
              className={`rounded-3xl px-4 py-4 ${
                projection.status === "caution"
                  ? "border border-warning/40 bg-surface"
                  : "bg-surface"
              }`}
            >
              <Text
                className={`text-sm font-semibold uppercase tracking-[1.8px] ${
                  projection.status === "caution" ? "text-warning" : "text-muted-strong"
                }`}
              >
                {projection.status === "caution" ? "Upozorenje" : "Napomena"}
              </Text>
              <Text className="mt-2 text-sm leading-6 text-muted-strong">
                {projection.message}
              </Text>
            </View>
          </>
        )}
      </Card>
    </Animated.View>
  );
}
