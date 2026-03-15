import { getElapsedDays } from "@/src/lib/date";
import { roundTo } from "@/src/lib/units";
import type { WeightEntry } from "@/src/types/app";

export type ChartPeriod = "week" | "all";
export type ProgressMilestoneTone = "default" | "accent" | "success";

export type ProgressMilestone = {
  id: string;
  badge: string;
  title: string;
  description: string;
  tone: ProgressMilestoneTone;
};

export function calcTotalLostKg(
  startingWeightKg: number | null,
  currentWeightKg: number | null,
) {
  if (startingWeightKg === null || currentWeightKg === null) {
    return 0;
  }

  return roundTo(Math.max(0, startingWeightKg - currentWeightKg), 1);
}

export function calcAverageDailyLossKg(totalLostKg: number, elapsedDays: number) {
  if (elapsedDays <= 0) {
    return 0;
  }

  return roundTo(totalLostKg / elapsedDays, 2);
}

export function calcEstimatedCaloriesFromFat(totalLostKg: number) {
  return Math.round(totalLostKg * 7700);
}

export function calcComplianceDays(
  weightHistory: WeightEntry[],
  startDate: string | null,
  today: string,
) {
  if (!startDate) {
    return 0;
  }

  const uniqueDays = new Set(
    weightHistory
      .filter((entry) => entry.date >= startDate && entry.date <= today)
      .map((entry) => entry.date),
  );

  return uniqueDays.size;
}

export function calcComplianceRate(complianceDays: number, elapsedDays: number) {
  if (elapsedDays <= 0) {
    return 0;
  }

  return Math.min(1, complianceDays / elapsedDays);
}

export function getPhaseLabel(elapsedDays: number, totalDays: number | null) {
  const currentWeek = Math.max(1, Math.ceil(Math.max(1, elapsedDays) / 7));

  if (!totalDays) {
    return `Nedelja ${currentWeek} - PSMF faza`;
  }

  return `Nedelja ${currentWeek} od ${Math.max(
    currentWeek,
    Math.ceil(totalDays / 7),
  )} - PSMF faza`;
}

export function getElapsedLabel(elapsedDays: number) {
  if (elapsedDays <= 1) {
    return "Za 1 dan";
  }

  return `Za ${elapsedDays} dana`;
}

export function getProtocolLabel(remainingDays: number | null) {
  if (remainingDays === null) {
    return "Plan bez roka";
  }

  if (remainingDays === 0) {
    return "Zavrsnica";
  }

  if (remainingDays === 1) {
    return "1 dan do kraja";
  }

  return `${remainingDays} dana do kraja`;
}

export function formatProgressDate(dateKey: string) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateKey}T00:00:00`));
}

export function formatWeightStat(weightKg: number | null) {
  if (weightKg === null) {
    return "—";
  }

  return `${roundTo(weightKg, 1)} kg`;
}

export function formatWeightDeltaKg(deltaKg: number) {
  return `${roundTo(deltaKg, 1)} kg`;
}

export function formatCaloriesStat(calories: number) {
  return `~${calories.toLocaleString("sr-RS")}`;
}

export function selectChartEntriesForPeriod(
  entries: WeightEntry[],
  period: ChartPeriod,
) {
  if (period === "all") {
    return entries;
  }

  return entries.slice(-7);
}

export function selectRecentEntries(entries: WeightEntry[], count = 5) {
  return [...entries].slice(-count).reverse();
}

export function buildProgressMilestones(params: {
  totalLostKg: number;
  complianceDays: number;
  elapsedDays: number;
  progress: number;
}) {
  const milestones: ProgressMilestone[] = [];

  if (params.totalLostKg > 0) {
    milestones.push({
      id: "first-loss",
      badge: `-${formatWeightDeltaKg(params.totalLostKg)}`,
      title: "Prvi minus je tu",
      description: "Vaga ide nadole. Nastavi istim ritmom i ne pokusavaj da na silu ubrzas rezultat.",
      tone: "success",
    });
  } else {
    milestones.push({
      id: "first-entry",
      badge: "Start",
      title: "Pocetna baza je sacuvana",
      description: "Unosi jutarnju tezinu svakog dana da grafikon dobije smisao i da trend postane koristan.",
      tone: "default",
    });
  }

  milestones.push({
    id: "consistency",
    badge: `${params.complianceDays}/${Math.max(1, params.elapsedDays)}`,
    title: "Ritam unosa",
    description:
      params.complianceDays >= Math.min(7, Math.max(1, params.elapsedDays))
        ? "Dobar niz. Doslednost daje jasan signal, ne jedan izdvojen broj."
        : "Jos malo doslednosti i trend ce biti cistiji i laksi za pracenje.",
    tone: params.complianceDays >= Math.min(7, Math.max(1, params.elapsedDays)) ? "accent" : "default",
  });

  milestones.push({
    id: "phase-progress",
    badge: `${Math.round(params.progress * 100)}%`,
    title: params.progress >= 1 ? "Faza je kompletirana" : "Faza je u toku",
    description:
      params.progress >= 1
        ? "Ceo plan je zavrsen. Sada mirno proceni sledeci korak, bez naglih korekcija."
        : "Prati ritam faze iz dana u dan. Voda i dnevne oscilacije ne menjaju smer ako se plana drzis.",
    tone: params.progress >= 1 ? "success" : "accent",
  });

  return milestones;
}

export function buildRecentWeightRows(entries: WeightEntry[]) {
  return entries.map((entry, index) => {
    const previous = entries[index + 1] ?? null;
    const deltaKg = previous ? roundTo(entry.kg - previous.kg, 1) : null;

    return {
      ...entry,
      deltaKg,
    };
  });
}

export function getElapsedDaysFromStart(startDate: string | null, today: string) {
  return startDate ? getElapsedDays(startDate, today) : 0;
}
