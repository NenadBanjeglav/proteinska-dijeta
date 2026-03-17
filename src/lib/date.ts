import type { WeightEntry } from "@/src/types/app";

const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayDate() {
  return toDateKey(new Date());
}

export function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`);
}

export function addDays(dateKey: string, days: number) {
  const next = parseDateKey(dateKey);
  next.setDate(next.getDate() + days);
  return toDateKey(next);
}

export function getDaysBetween(startDate: string, endDate: string) {
  const start = parseDateKey(startDate).getTime();
  const end = parseDateKey(endDate).getTime();

  return Math.floor((end - start) / DAY_MS);
}

export function getElapsedDays(startDate: string, today = getTodayDate()) {
  return Math.max(0, getDaysBetween(startDate, today) + 1);
}

export function sortWeightHistory(entries: WeightEntry[]) {
  return [...entries].sort((left, right) => left.date.localeCompare(right.date));
}
