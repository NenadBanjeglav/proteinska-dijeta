import { useEffect, useMemo, useState } from "react";
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
import { formatProjectionDate, formatProjectedDays } from "@/src/lib/projection";
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
  formatSignedWeightDeltaKg,
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
    return "1 merenje u istoriji";
  }

  return `${count} merenja u istoriji`;
}

function getSelectedEntryDelta(entries: { date: string; kg: number }[], date: string | null) {
  if (!date) {
    return null;
  }

  const index = entries.findIndex((entry) => entry.date === date);
  if (index <= 0) {
    return null;
  }

  return entries[index].kg - entries[index - 1].kg;
}

export default function ProgressRoute() {
  const data = usePsmfStore((store) => store.data);
  const { today } = useToday();
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState<ChartPeriod>("month");
  const [selectedChartDate, setSelectedChartDate] = useState<string | null>(null);
  const onboarded = selectIsOnboarded(data);
  const compact = width < 390;
  const singleColumnStats = width < 360;
  const contentWidth = Math.max(280, width - 48);
  const defaultChartWidth = Math.max(220, contentWidth - 40);
  const statsCardWidth = singleColumnStats ? contentWidth : (contentWidth - 12) / 2;
  const [chartWidth, setChartWidth] = useState(defaultChartWidth);

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
  const latestEntry = entries[entries.length - 1] ?? null;
  const hasTodayEntry = latestEntry?.date === today;
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

  const selectedChartEntry = useMemo(
    () =>
      chartEntries.find((entry) => entry.date === selectedChartDate) ??
      chartEntries[chartEntries.length - 1] ??
      null,
    [chartEntries, selectedChartDate],
  );
  const selectedChartDeltaKg = useMemo(
    () => getSelectedEntryDelta(entries, selectedChartEntry?.date ?? null),
    [entries, selectedChartEntry?.date],
  );

  useEffect(() => {
    setChartWidth(defaultChartWidth);
  }, [defaultChartWidth]);

  useEffect(() => {
    const latestVisibleDate = chartEntries[chartEntries.length - 1]?.date ?? null;

    if (!latestVisibleDate) {
      setSelectedChartDate(null);
      return;
    }

    if (
      selectedChartDate === null ||
      !chartEntries.some((entry) => entry.date === selectedChartDate)
    ) {
      setSelectedChartDate(latestVisibleDate);
    }
  }, [chartEntries, selectedChartDate]);

  if (!onboarded) {
    return (
      <Screen>
        <EmptyState
          badge="Čeka onboarding"
          description="Kad završiš onboarding i sačuvaš početnu težinu, ovde ćeš videti trend, istoriju i tempo napretka."
          title="Još nema podataka za napredak"
        />
      </Screen>
    );
  }

  return (
    <Screen contentClassName="gap-5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-[40px] font-black leading-[44px] text-text">Napredak</Text>
          <Text className="text-base text-muted">
            {goalProjection
              ? `Cilj ${formatWeightStat(data.goalWeightKg)} uz projekciju uživo`
              : getPhaseLabel(elapsedDays, protocol.totalDays)}
          </Text>
        </View>

        <View className="pt-1">
          <HeaderActionButton
            accessibilityLabel="Podešavanja"
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
          goalProgress ? "Napredak ka ciljnoj težini" : "Napredak kroz fazu"
        }
        startingWeightLabel={formatWeightStat(data.startingWeightKg)}
        totalLostLabel={`${totalLostKg} kg`}
      />

      {currentProtocolContext ? (
        <Card className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Današnji cilj proteina
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
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Današnji cilj</Text>
              <Text className="text-2xl font-black text-text">
                {currentProtocolContext.proteinTargetG} g
              </Text>
            </View>
          </View>

          <Text className="text-sm leading-6 text-muted">
            {nextCategoryThreshold
              ? `Sledeća veća promena je oko ${formatWeightStat(nextCategoryThreshold.weightKg)}, kada ulaziš u ${nextCategoryThreshold.targetCategoryLabel}.`
              : "Cilj se sada menja postepeno sa svakom promenom težine."}
          </Text>
        </Card>
      ) : null}

      {goalProjection ? (
        <GoalProjectionCard
          description="Ovaj grafikon se osvežava po poslednjoj sačuvanoj jutarnjoj težini, ne samo po brojevima sa početka."
          eyebrow="Projekcija"
          projection={goalProjection}
          title="Putanja do ciljne težine"
        />
      ) : (
        <Card className="gap-4 border-warning/30 bg-surface">
          <View className="gap-1">
            <Text className="text-sm font-semibold uppercase tracking-[1.8px] text-warning">
              Nedostaje ciljna težina
            </Text>
            <Text className="text-2xl font-black text-text">
              Uključi projekciju do cilja
            </Text>
          </View>
          <Text className="text-sm leading-6 text-muted">
            Dodaj ciljnu težinu u podešavanjima da bismo izračunali koliko je još ostalo do cilja i nacrtali projekciju.
          </Text>
          <PrimaryButton
            label="Dodaj ciljnu težinu"
            onPress={() => router.push("../settings")}
            variant="secondary"
          />
        </Card>
      )}

      <Card className="gap-4">
        <View className={compact ? "gap-3" : "flex-row items-center justify-between gap-3"}>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-2xl font-bold text-text">Grafikon težine</Text>
            <Text className="text-sm leading-6 text-muted">
              {entries.length
                ? getEntriesHistoryLabel(entries.length)
                : "Unesi jutarnju težinu da bismo prikazali smislen trend."}
            </Text>
          </View>
          <ProgressPeriodToggle onChange={setPeriod} value={period} />
        </View>

        {selectedChartEntry ? (
          <View className="rounded-3xl bg-surface-soft px-4 py-4">
            <View className="flex-row flex-wrap gap-3">
              <View className="min-w-[120px] flex-1 gap-1">
                <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-warning">
                  Izabrano merenje
                </Text>
                <Text
                  className="text-3xl font-black text-text"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {selectedChartEntry.kg} kg
                </Text>
                <Text className="text-sm text-muted">
                  {formatProgressDate(selectedChartEntry.date)}
                </Text>
              </View>

              <View className="min-w-[120px] flex-1 gap-1">
                <Text className="text-xs uppercase tracking-[1.6px] text-muted">Promena</Text>
                <Text
                  className="text-2xl font-black text-text"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {selectedChartDeltaKg === null
                    ? "Start"
                    : formatSignedWeightDeltaKg(selectedChartDeltaKg)}
                </Text>
                <Text className="text-sm text-muted">
                  {selectedChartDeltaKg === null
                    ? "Prvo merenje u istoriji"
                    : "u odnosu na prethodno merenje"}
                </Text>
              </View>

              <View className="min-w-[120px] flex-1 gap-1">
                <Text className="text-xs uppercase tracking-[1.6px] text-muted">Poslednje</Text>
                <Text
                  className="text-2xl font-black text-text"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {latestEntry ? `${latestEntry.kg} kg` : "-"}
                </Text>
                <Text className="text-sm text-muted">
                  {latestEntry ? formatProgressDate(latestEntry.date) : "Još nema istorije"}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View
          onLayout={(event) => {
            const nextWidth = Math.round(event.nativeEvent.layout.width);
            if (Math.abs(nextWidth - chartWidth) > 1) {
              setChartWidth(nextWidth);
            }
          }}
        >
          <WeightChart
            entries={chartEntries}
            onSelectDate={setSelectedChartDate}
            selectedDate={selectedChartDate}
            width={chartWidth}
          />
        </View>

        {chartEntries.length > 1 ? (
          <Text className="text-sm leading-6 text-muted">
            Dodirni tačku na grafikonu da vidiš tačan datum i promenu u odnosu na prethodno merenje.
          </Text>
        ) : null}

        {!hasTodayEntry ? (
          <View className="gap-3 rounded-3xl border border-warning/25 bg-surface-soft px-4 py-4">
            <View className="gap-1">
              <Text className="text-sm font-semibold uppercase tracking-[1.8px] text-warning">
                Nedostaje današnje merenje
              </Text>
              <Text className="text-base leading-6 text-muted-strong">
                Dodaj jutarnju težinu za danas da grafikon i projekcija ostanu tačni.
              </Text>
            </View>
            <PrimaryButton
              label="Dodaj današnju težinu"
              onPress={() => router.push("/(tabs)/home")}
              variant="secondary"
            />
          </View>
        ) : (
          <View className="rounded-3xl bg-surface-soft px-4 py-4">
            <Text className="text-sm leading-6 text-muted-strong">
              Današnje merenje je već evidentirano. Nastavi da beležiš jutarnju težinu iz dana u dan da trend ostane čist.
            </Text>
          </View>
        )}
      </Card>

      <View className="flex-row flex-wrap gap-3">
        <ProgressStatCard
          compact={compact}
          label="Prosečan dnevni pad"
          style={{ width: statsCardWidth }}
          subtitle="Od početka faze do danas"
          tone="blue"
          value={`${averageDailyLossKg} kg`}
        />
        <ProgressStatCard
          compact={compact}
          label="Energija iz masti"
          style={{ width: statsCardWidth }}
          subtitle="Gruba procena po ukupnom padu težine"
          tone="orange"
          value={formatCaloriesStat(caloriesFromFat)}
        />
        <ProgressStatCard
          compact={compact}
          label="Ritam praćenja"
          style={{ width: statsCardWidth }}
          subtitle={`${Math.round(complianceRate * 100)}% dana ima jutarnje merenje`}
          tone="green"
          value={`${complianceDays}/${Math.max(1, elapsedDays)}`}
        />
        <ProgressStatCard
          compact={compact}
          label="Ukupno merenja"
          style={{ width: statsCardWidth }}
          subtitle={
            entries.length > 1
              ? "Dovoljno za poređenje kroz vreme"
              : "Za sada imaš jednu referentnu tačku"
          }
          tone="purple"
          value={`${entries.length}`}
        />
      </View>

      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
          Poslednja merenja
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
                    ? "Prvo merenje u istoriji"
                    : `${formatSignedWeightDeltaKg(entry.deltaKg)} u odnosu na prethodno merenje`}
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
            description="Kad uneseš prvu jutarnju težinu, ovde ćeš videti istoriju merenja i trend kroz vreme."
            title="Još nema istorije težine"
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
