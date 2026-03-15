import { useEffect, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";

import { MilestoneCard } from "@/src/components/progress/milestone-card";
import { ProgressHeroCard } from "@/src/components/progress/progress-hero-card";
import { ProgressPeriodToggle } from "@/src/components/progress/progress-period-toggle";
import { ProgressStatCard } from "@/src/components/progress/progress-stat-card";
import { WeightChart } from "@/src/components/progress/weight-chart";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Screen } from "@/src/components/ui/screen";
import { useToday } from "@/src/hooks/use-today";
import {
  buildProgressMilestones,
  buildRecentWeightRows,
  calcAverageDailyLossKg,
  calcComplianceDays,
  calcComplianceRate,
  calcEstimatedCaloriesFromFat,
  calcTotalLostKg,
  formatCaloriesStat,
  formatProgressDate,
  formatWeightDeltaKg,
  formatWeightStat,
  getElapsedDaysFromStart,
  getElapsedLabel,
  getPhaseLabel,
  getProtocolLabel,
  selectChartEntriesForPeriod,
  selectRecentEntries,
  type ChartPeriod,
} from "@/src/lib/progress";
import { usePsmfStore } from "@/src/store/psmf-store";
import {
  selectCurrentWeightKg,
  selectIsOnboarded,
  selectProtocolProgress,
  selectWeightHistory,
} from "@/src/store/selectors";

function getEntriesHistoryLabel(count: number) {
  if (count === 1) {
    return "1 unos u istoriji";
  }

  return `${count} unosa u istoriji`;
}

export default function ProgressRoute() {
  const data = usePsmfStore((store) => store.data);
  const { today } = useToday();
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState<ChartPeriod>("week");
  const onboarded = selectIsOnboarded(data);
  const compact = width < 390;
  const singleColumnStats = width < 360;
  const contentWidth = Math.max(280, width - 48);
  const defaultChartWidth = Math.max(220, contentWidth - 40);
  const statsCardWidth = singleColumnStats ? contentWidth : (contentWidth - 12) / 2;
  const [chartWidth, setChartWidth] = useState(defaultChartWidth);

  useEffect(() => {
    setChartWidth(defaultChartWidth);
  }, [defaultChartWidth]);

  if (!onboarded) {
    return (
      <Screen>
        <EmptyState
          badge="Ceka onboarding"
          description="Cim zavrsis onboarding i sacuvas pocetnu tezinu, ovde ces videti trend, istoriju i tempo napretka."
          title="Jos nema podataka za trend"
        />
      </Screen>
    );
  }

  const entries = selectWeightHistory(data);
  const currentWeightKg = selectCurrentWeightKg(data);
  const protocol = selectProtocolProgress(data, today);
  const elapsedDays = getElapsedDaysFromStart(data.startDate, today);
  const totalLostKg = calcTotalLostKg(data.startingWeightKg, currentWeightKg);
  const averageDailyLossKg = calcAverageDailyLossKg(totalLostKg, Math.max(1, elapsedDays));
  const complianceDays = calcComplianceDays(entries, data.startDate, today);
  const complianceRate = calcComplianceRate(complianceDays, Math.max(1, elapsedDays));
  const caloriesFromFat = calcEstimatedCaloriesFromFat(totalLostKg);
  const chartEntries = selectChartEntriesForPeriod(entries, period);
  const recentRows = buildRecentWeightRows(selectRecentEntries(entries, 5));
  const milestones = buildProgressMilestones({
    totalLostKg,
    complianceDays,
    elapsedDays,
    progress: protocol.progress,
  });

  return (
    <Screen contentClassName="gap-5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-[40px] font-black leading-[44px] text-text">Napredak</Text>
          <Text className="text-base text-muted">
            {getPhaseLabel(elapsedDays, protocol.totalDays)}
          </Text>
        </View>

        <View className="min-w-[94px] shrink-0 rounded-2xl border border-border bg-surface px-4 py-3">
          <Text className="text-center text-sm font-semibold text-muted-strong">
            Nedelja
          </Text>
        </View>
      </View>

      <ProgressHeroCard
        compact={compact}
        currentWeightLabel={formatWeightStat(currentWeightKg)}
        elapsedLabel={getElapsedLabel(Math.max(1, elapsedDays))}
        footerCenter={getProtocolLabel(protocol.remainingDays)}
        footerLeft={formatWeightStat(data.startingWeightKg)}
        footerRight={`Dan ${Math.max(1, protocol.elapsedDays)}`}
        footerStack={singleColumnStats}
        progress={protocol.progress}
        progressPercentLabel={`${Math.round(protocol.progress * 100)}%`}
        progressTitle="Napredak kroz fazu"
        startingWeightLabel={formatWeightStat(data.startingWeightKg)}
        totalLostLabel={formatWeightDeltaKg(totalLostKg)}
      />

      <Card className="gap-4">
        <View className={compact ? "gap-3" : "flex-row items-center justify-between gap-3"}>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-2xl font-bold text-text">Grafikon tezine</Text>
            <Text className="text-sm leading-6 text-muted">
              {entries.length
                ? getEntriesHistoryLabel(entries.length)
                : "Unesi jutarnju tezinu da trend krene da zivi."}
            </Text>
          </View>
          <ProgressPeriodToggle onChange={setPeriod} value={period} />
        </View>

        <View
          onLayout={(event) => {
            const nextWidth = Math.round(event.nativeEvent.layout.width);
            if (Math.abs(nextWidth - chartWidth) > 1) {
              setChartWidth(nextWidth);
            }
          }}
        >
          <WeightChart entries={chartEntries} width={chartWidth} />
        </View>
      </Card>

      <View className="flex-row flex-wrap gap-3">
        <ProgressStatCard
          compact={compact}
          label="Dnevni minus"
          style={{ width: statsCardWidth }}
          subtitle="Tempo kroz ceo dosadasnji tok"
          tone="blue"
          value={`${averageDailyLossKg} kg`}
        />
        <ProgressStatCard
          compact={compact}
          label="Kalorije iz masti"
          style={{ width: statsCardWidth }}
          subtitle="Gruba procena na osnovu ukupnog minusa"
          tone="orange"
          value={formatCaloriesStat(caloriesFromFat)}
        />
        <ProgressStatCard
          compact={compact}
          label="Uskladjenost"
          style={{ width: statsCardWidth }}
          subtitle="Dani sa jutarnjim unosom tezine"
          tone="green"
          value={`${complianceDays}/${Math.max(1, elapsedDays)}`}
        />
        <ProgressStatCard
          compact={compact}
          label="Ukupno unosa"
          style={{ width: statsCardWidth }}
          subtitle={`${Math.round(complianceRate * 100)}% discipline u pracenju`}
          tone="purple"
          value={`${entries.length}`}
        />
      </View>

      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
          Poslednji unosi
        </Text>
        {recentRows.length ? (
          recentRows.map((entry) => (
            <Card key={entry.date} className="flex-row items-center gap-3 py-4">
              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-base font-bold text-text">
                  {formatProgressDate(entry.date)}
                </Text>
                <Text className="text-sm text-muted" numberOfLines={2}>
                  {entry.deltaKg === null
                    ? "Prvi upis u istoriji"
                    : `${entry.deltaKg > 0 ? "+" : ""}${entry.deltaKg} kg vs prethodni unos`}
                </Text>
              </View>
              <Text
                className="w-[96px] shrink-0 text-right text-2xl font-black text-text"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {entry.kg} kg
              </Text>
            </Card>
          ))
        ) : (
          <EmptyState
            badge="Prazna istorija"
            description="Cim upises prvu jutarnju tezinu, ovde ces videti dnevni log i trend kroz vreme."
            title="Jos nema logova tezine"
          />
        )}
      </View>

      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
          Milestones
        </Text>
        {milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            badge={milestone.badge}
            description={milestone.description}
            title={milestone.title}
            tone={milestone.tone}
          />
        ))}
      </View>
    </Screen>
  );
}
