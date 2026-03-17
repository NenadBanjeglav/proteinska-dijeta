import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Text, View, useWindowDimensions } from "react-native";

import { GoalProjectionCard } from "@/src/components/projection/goal-projection-card";
import { MilestoneCard } from "@/src/components/progress/milestone-card";
import { ProgressHeroCard } from "@/src/components/progress/progress-hero-card";
import { ProgressPeriodToggle } from "@/src/components/progress/progress-period-toggle";
import { ProgressStatCard } from "@/src/components/progress/progress-stat-card";
import { WeightChart } from "@/src/components/progress/weight-chart";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { HeaderActionButton } from "@/src/components/ui/header-action-button";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { Screen } from "@/src/components/ui/screen";
import { useToday } from "@/src/hooks/use-today";
import {
  formatProjectionDate,
  formatProjectedDays,
} from "@/src/lib/projection";
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
  selectCurrentProtocolContext,
  selectGoalProgress,
  selectGoalProjection,
  selectIsOnboarded,
  selectNextCategoryThreshold,
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
          description="Kad zavrsis onboarding i sacuvas pocetnu tezinu, ovde ces videti trend, istoriju i tempo napretka."
          title="Jos nema podataka za napredak"
        />
      </Screen>
    );
  }

  const entries = selectWeightHistory(data);
  const currentWeightKg = selectCurrentWeightKg(data);
  const currentProtocolContext = selectCurrentProtocolContext(data);
  const nextCategoryThreshold = selectNextCategoryThreshold(data);
  const protocol = selectProtocolProgress(data, today);
  const goalProjection = selectGoalProjection(data, today);
  const goalProgress = selectGoalProgress(data);
  const elapsedDays = getElapsedDaysFromStart(data.startDate, today);
  const totalLostKg = calcTotalLostKg(data.startingWeightKg, currentWeightKg);
  const averageDailyLossKg = calcAverageDailyLossKg(totalLostKg, Math.max(1, elapsedDays));
  const complianceDays = calcComplianceDays(entries, data.startDate, today);
  const complianceRate = calcComplianceRate(complianceDays, Math.max(1, elapsedDays));
  const caloriesFromFat = calcEstimatedCaloriesFromFat(totalLostKg);
  const chartEntries = selectChartEntriesForPeriod(entries, period);
  const recentRows = buildRecentWeightRows(selectRecentEntries(entries, 5));
  const heroProgress = goalProgress?.progress ?? protocol.progress;
  const heroElapsedLabel =
    goalProjection?.projectedDays !== null && goalProjection?.projectedDays !== undefined
      ? goalProjection.projectedDays === 0
        ? "Cilj je dostignut"
        : `~${formatProjectedDays(goalProjection.projectedDays)} do cilja`
      : getElapsedLabel(Math.max(1, elapsedDays));
  const milestones = buildProgressMilestones({
    totalLostKg,
    complianceDays,
    elapsedDays,
    progress: heroProgress,
  });

  return (
    <Screen contentClassName="gap-5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-[40px] font-black leading-[44px] text-text">Napredak</Text>
          <Text className="text-base text-muted">
            {goalProjection
              ? `Cilj ${formatWeightStat(data.goalWeightKg)} uz live projekciju`
              : getPhaseLabel(elapsedDays, protocol.totalDays)}
          </Text>
        </View>

        <View className="pt-1">
          <HeaderActionButton
            accessibilityLabel="Podesavanja"
            icon="settings-outline"
            onPress={() => router.push("../settings")}
          />
        </View>
      </View>

      <ProgressHeroCard
        compact={compact}
        currentWeightLabel={formatWeightStat(currentWeightKg)}
        elapsedLabel={heroElapsedLabel}
        footerCenter={
          goalProjection?.projectedTargetDate
            ? `Oko ${formatProjectionDate(goalProjection.projectedTargetDate)}`
            : getProtocolLabel(protocol.remainingDays)
        }
        footerLeft={`Start ${formatWeightStat(data.startingWeightKg)}`}
        footerRight={
          data.goalWeightKg !== null
            ? `Cilj ${formatWeightStat(data.goalWeightKg)}`
            : `Dan ${Math.max(1, protocol.elapsedDays)}`
        }
        footerStack={singleColumnStats}
        progress={heroProgress}
        progressPercentLabel={`${Math.round(heroProgress * 100)}%`}
        progressTitle={
          goalProgress ? "Napredak ka ciljnoj tezini" : "Napredak kroz fazu"
        }
        startingWeightLabel={formatWeightStat(data.startingWeightKg)}
        totalLostLabel={formatWeightDeltaKg(totalLostKg)}
      />

      {currentProtocolContext ? (
        <Card className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Danasnji cilj proteina
          </Text>

          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[120px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Trenutno</Text>
              <Text className="text-2xl font-black text-text">
                {currentProtocolContext.categoryLabel}
              </Text>
            </View>
            <View className="min-w-[120px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Procena BF</Text>
              <Text className="text-2xl font-black text-text">
                ~{currentProtocolContext.estimatedBodyFatPct.toFixed(1)}%
              </Text>
            </View>
            <View className="min-w-[120px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Danasnji cilj</Text>
              <Text className="text-2xl font-black text-text">
                {currentProtocolContext.proteinTargetG} g
              </Text>
            </View>
          </View>

          <Text className="text-sm leading-6 text-muted">
            {nextCategoryThreshold
              ? `Sledeca veca promena oko ${formatWeightStat(nextCategoryThreshold.weightKg)}, kada ulazis u ${nextCategoryThreshold.targetCategoryLabel}.`
              : "Cilj se sada menja postepeno sa svakom promenom tezine."}
          </Text>
        </Card>
      ) : null}

      {goalProjection ? (
        <GoalProjectionCard
          description="Ovaj grafik se osvezava po poslednjoj sacuvanoj jutarnjoj tezini, ne samo po brojevima sa pocetka."
          eyebrow="Projekcija"
          projection={goalProjection}
          title="Putanja do ciljne tezine"
        />
      ) : (
        <Card className="gap-4 border-warning/30 bg-surface">
          <View className="gap-1">
            <Text className="text-sm font-semibold uppercase tracking-[1.8px] text-warning">
              Nedostaje ciljna tezina
            </Text>
            <Text className="text-2xl font-black text-text">
              Ukljuci projekciju do cilja
            </Text>
          </View>
          <Text className="text-sm leading-6 text-muted">
            Dodaj ciljnu tezinu u podesavanjima da bismo izracunali koliko je jos ostalo do cilja i nacrtali projekciju.
          </Text>
          <PrimaryButton
            label="Dodaj ciljnu tezinu"
            onPress={() => router.push("../settings")}
            variant="secondary"
          />
        </Card>
      )}

      <Card className="gap-4">
        <View className={compact ? "gap-3" : "flex-row items-center justify-between gap-3"}>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-2xl font-bold text-text">Grafikon tezine</Text>
            <Text className="text-sm leading-6 text-muted">
              {entries.length
                ? getEntriesHistoryLabel(entries.length)
                : "Unesi jutarnju tezinu da bismo prikazali smislen trend."}
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
          subtitle="Dani sa unetom jutarnjom tezinom"
          tone="green"
          value={`${complianceDays}/${Math.max(1, elapsedDays)}`}
        />
        <ProgressStatCard
          compact={compact}
          label="Broj unosa"
          style={{ width: statsCardWidth }}
          subtitle={`${Math.round(complianceRate * 100)}% doslednosti u pracenju`}
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
                    ? "Prvi unos u istoriji"
                    : `${entry.deltaKg > 0 ? "+" : ""}${entry.deltaKg} kg u odnosu na prethodni unos`}
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
            description="Kad uneses prvu jutarnju tezinu, ovde ces videti istoriju unosa i trend kroz vreme."
            title="Jos nema istorije tezine"
          />
        )}
      </View>

      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
          Prekretnice
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
