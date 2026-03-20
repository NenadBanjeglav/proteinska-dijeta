import { roundTo } from "@/src/lib/units";
import type { WeightEntry } from "@/src/types/app";

export type WeightDeltaTone = "success" | "danger" | "neutral";

export function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Dobro jutro";
  }

  if (hour < 18) {
    return "Dobar dan";
  }

  return "Dobro veče";
}

export function getDayLabel(elapsedDays: number, totalDays: number | null) {
  const elapsed = `${Math.max(1, elapsedDays)}`.padStart(2, "0");

  if (totalDays === null) {
    return `DAN ${elapsed}`;
  }

  return `DAN ${elapsed} OD ${`${totalDays}`.padStart(2, "0")}`;
}

export function getRemainingLabel(remainingDays: number | null) {
  if (remainingDays === null) {
    return "Plan bez roka";
  }

  if (remainingDays === 0) {
    return "Završni dan";
  }

  if (remainingDays === 1) {
    return "1 dan preostao";
  }

  return `${remainingDays} dana preostalo`;
}

export function getMealsSummary(mealCount: number, proteinConsumed: number) {
  const mealLabel = mealCount === 1 ? "obrok" : "obroka";
  return `${mealCount} ${mealLabel} • ukupno ${proteinConsumed} g proteina`;
}

export function getWeightDelta(
  todayEntry: WeightEntry | null,
  previousEntry: WeightEntry | null,
) {
  if (!todayEntry || !previousEntry || previousEntry.date >= todayEntry.date) {
    return null;
  }

  return roundTo(todayEntry.kg - previousEntry.kg, 1);
}

export function getWeightDeltaTone(deltaKg: number | null): WeightDeltaTone {
  if (deltaKg === null || deltaKg === 0) {
    return "neutral";
  }

  return deltaKg < 0 ? "success" : "danger";
}

export function getWeightDeltaLabel(deltaKg: number | null) {
  if (deltaKg === null) {
    return "Prvi unos • još nema poređenja";
  }

  if (deltaKg === 0) {
    return "Isto kao juče";
  }

  const prefix = deltaKg > 0 ? "+" : "";
  return `${prefix}${roundTo(deltaKg, 1)} kg u odnosu na juče`;
}

export function getWeightDeltaMessage(deltaKg: number | null) {
  if (deltaKg === null) {
    return "Ovo je prvi unos. Već od sutra imaćeš poređenje sa prethodnim danom.";
  }

  if (deltaKg === 0) {
    return "Danas nema promene. Važniji je trend kroz više dana nego jedan broj.";
  }

  if (deltaKg < 0) {
    return "Pad je dobar signal. Nastavi po planu i ne pokušavaj da na silu ubrzaš minus.";
  }

  return "Kratkoročan skok je normalan. Voda, so i varenje često objasne veći deo razlike.";
}

export function formatWeightKg(weightKg: number) {
  return `${roundTo(weightKg, 1)} kg`;
}
