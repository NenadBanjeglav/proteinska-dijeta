export function kgToLbs(kg: number) {
  return kg * 2.20462;
}

export function lbsToKg(lbs: number) {
  return lbs / 2.20462;
}

export function cmToMeters(cm: number) {
  return cm / 100;
}

export function roundTo(value: number, places = 1) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function safeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function formatRoundedNumber(
  value: number | null | undefined,
  places = 1,
) {
  const rounded = roundTo(safeNumber(value), places);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(places);
}

export function formatMacroGrams(value: number | null | undefined) {
  return formatRoundedNumber(value, 1);
}

export function formatKcal(value: number | null | undefined) {
  return String(Math.round(safeNumber(value)));
}
