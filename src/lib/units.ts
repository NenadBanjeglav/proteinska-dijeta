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
