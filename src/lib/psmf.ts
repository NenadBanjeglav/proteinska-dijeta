import type { Activity, Gender, ProtocolCategory } from "@/src/types/app";
import { kgToLbs } from "@/src/lib/units";

const CATEGORY_RANGES: Record<ProtocolCategory, Record<Activity, [number, number]>> =
  {
    1: {
      inactive: [1, 1.25],
      aerobics: [1.25, 1.5],
      weights: [1.5, 2],
    },
    2: {
      inactive: [0.9, 0.9],
      aerobics: [1.1, 1.1],
      weights: [1.25, 1.25],
    },
    3: {
      inactive: [0.8, 0.8],
      aerobics: [0.9, 0.9],
      weights: [1, 1],
    },
  };

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getCategory(gender: Gender, bodyFatPct: number): ProtocolCategory {
  if (gender === "male") {
    if (bodyFatPct <= 15) return 1;
    if (bodyFatPct <= 25) return 2;
    return 3;
  }

  if (bodyFatPct <= 24) return 1;
  if (bodyFatPct <= 34) return 2;
  return 3;
}

export function getProteinRange(category: ProtocolCategory, activity: Activity) {
  return CATEGORY_RANGES[category][activity];
}

export function calcProteinMultiplier(
  gender: Gender,
  bodyFatPct: number,
  activity: Activity,
) {
  const category = getCategory(gender, bodyFatPct);
  const [min, max] = getProteinRange(category, activity);

  if (category !== 1) {
    return min;
  }

  const ratio =
    gender === "male"
      ? clamp((15 - bodyFatPct) / (15 - 4), 0, 1)
      : clamp((24 - bodyFatPct) / (24 - 8), 0, 1);

  return min + ratio * (max - min);
}

export function calcLeanBodyMassKg(weightKg: number, bodyFatPct: number) {
  return weightKg * (1 - bodyFatPct / 100);
}

export function calcLeanBodyMassLbs(weightKg: number, bodyFatPct: number) {
  return kgToLbs(calcLeanBodyMassKg(weightKg, bodyFatPct));
}

export function calcProteinTarget(
  weightKg: number,
  bodyFatPct: number,
  gender: Gender,
  activity: Activity,
) {
  const lbmLbs = calcLeanBodyMassLbs(weightKg, bodyFatPct);
  const multiplier = calcProteinMultiplier(gender, bodyFatPct, activity);

  return Math.round(lbmLbs * multiplier);
}

export function calcEstimatedCalories(proteinG: number) {
  return Math.round(proteinG * 4 + 20);
}

export function calcWaterTargetGlasses(weightKg: number) {
  return Math.max(1, Math.round((weightKg * 35) / 250));
}
