import type { Href } from "expo-router";

import { GOAL_DAYS } from "@/src/constants/protocol";
import { calcBmi, canEstimateBodyFatFromBmi, estimateBodyFatFromBmi } from "@/src/lib/bmi";
import { getTodayDate } from "@/src/lib/date";
import {
  calcEstimatedCalories,
  calcLeanBodyMassKg,
  calcLeanBodyMassLbs,
  calcProteinMultiplier,
  calcProteinTarget,
  getCategory,
  getProteinRange,
} from "@/src/lib/psmf";
import { cmToMeters, kgToLbs, lbsToKg, roundTo } from "@/src/lib/units";
import type {
  OnboardingProfile,
  OnboardingWizardState,
  WeightUnit,
} from "@/src/types/app";

export type OnboardingStep = OnboardingWizardState["step"];

export type ProteinPreview = {
  bmi: number | null;
  bodyFatPct: number;
  category: 1 | 2 | 3;
  proteinRange: [number, number];
  proteinMultiplier: number;
  proteinTargetG: number;
  estimatedCalories: number;
  leanBodyMassKg: number;
  leanBodyMassLbs: number;
};

export type OnboardingPreview = ProteinPreview & {
  goalTotalDays: number;
  startDate: string;
};

const STEP_SEQUENCE: OnboardingStep[] = [1, 2, 3, 4, 5, 6, 7, 8];

const STEP_ROUTES: Record<OnboardingStep, Href> = {
  1: "/onboarding/welcome",
  2: "/onboarding/name",
  3: "/onboarding/gender",
  4: "/onboarding/weight",
  5: "/onboarding/body-fat",
  6: "/onboarding/activity",
  7: "/onboarding/goal",
  8: "/onboarding/summary",
};

export const INITIAL_ONBOARDING_STATE: OnboardingWizardState = {
  step: 1,
  userName: "",
  gender: "male",
  weightKg: null,
  weightUnit: "kg",
  bodyFatMode: "manual",
  bodyFatPct: null,
  heightCm: null,
  activity: null,
  goalType: null,
};

export function getRouteForStep(step: OnboardingStep) {
  return STEP_ROUTES[step];
}

export function getNextStep(step: OnboardingStep) {
  const index = STEP_SEQUENCE.indexOf(step);
  return STEP_SEQUENCE[index + 1] ?? null;
}

export function getPreviousStep(step: OnboardingStep) {
  const index = STEP_SEQUENCE.indexOf(step);
  return STEP_SEQUENCE[index - 1] ?? null;
}

export function parseNumberInput(value: string) {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatNumberInput(value: number | null, places = 1) {
  if (value === null) {
    return "";
  }

  return roundTo(value, places).toString().replace(/\.0$/, "");
}

export function isProteinRangeFixed(range: [number, number]) {
  return range[0] === range[1];
}

export function formatProteinRangeLabel(range: [number, number]) {
  if (isProteinRangeFixed(range)) {
    return `${formatNumberInput(range[0], 2)} g/lb`;
  }

  return `${formatNumberInput(range[0], 2)}-${formatNumberInput(range[1], 2)} g/lb`;
}

export function formatProteinMultiplierLabel(multiplier: number) {
  return `${formatNumberInput(multiplier, 2)} g/lb`;
}

export function formatWeightForUnit(weightKg: number | null, unit: WeightUnit) {
  if (weightKg === null) {
    return "";
  }

  return formatNumberInput(unit === "kg" ? weightKg : kgToLbs(weightKg), 1);
}

export function convertWeightToKg(value: number, unit: WeightUnit) {
  return unit === "kg" ? value : lbsToKg(value);
}

export function isNameValid(name: string) {
  return name.trim().length > 0;
}

export function isWeightValid(weightKg: number | null) {
  return weightKg !== null && weightKg >= 35 && weightKg <= 350;
}

export function isBodyFatValid(bodyFatPct: number | null) {
  return bodyFatPct !== null && bodyFatPct >= 4 && bodyFatPct <= 60;
}

export function isHeightValid(heightCm: number | null) {
  return heightCm !== null && heightCm >= 120 && heightCm <= 240;
}

export function getBmiEstimate(state: OnboardingWizardState) {
  if (!isWeightValid(state.weightKg) || !isHeightValid(state.heightCm)) {
    return {
      bmi: null,
      estimatedBodyFatPct: null,
      supported: false,
    };
  }

  const weightKg = state.weightKg!;
  const heightCm = state.heightCm!;
  const bmi = calcBmi(weightKg, cmToMeters(heightCm));
  if (!canEstimateBodyFatFromBmi(bmi, state.gender)) {
    return {
      bmi,
      estimatedBodyFatPct: null,
      supported: false,
    };
  }

  const estimatedBodyFatPct = estimateBodyFatFromBmi(bmi, state.gender);

  return {
    bmi,
    estimatedBodyFatPct:
      estimatedBodyFatPct === null ? null : roundTo(estimatedBodyFatPct, 1),
    supported: estimatedBodyFatPct !== null,
  };
}

export function resolveBodyFatPct(state: OnboardingWizardState) {
  if (state.bodyFatMode === "manual") {
    return isBodyFatValid(state.bodyFatPct) ? state.bodyFatPct : null;
  }

  return getBmiEstimate(state).estimatedBodyFatPct;
}

export function isStepValid(state: OnboardingWizardState, step: OnboardingStep) {
  switch (step) {
    case 1:
      return true;
    case 2:
      return isNameValid(state.userName);
    case 3:
      return true;
    case 4:
      return isWeightValid(state.weightKg);
    case 5:
      return resolveBodyFatPct(state) !== null;
    case 6:
      return state.activity !== null;
    case 7:
      return state.goalType !== null;
    case 8:
      return buildOnboardingProfile(state) !== null;
  }
}

export function getFirstIncompleteStep(state: OnboardingWizardState): OnboardingStep {
  if (!isNameValid(state.userName)) {
    return 2;
  }

  if (!isWeightValid(state.weightKg)) {
    return 4;
  }

  if (resolveBodyFatPct(state) === null) {
    return 5;
  }

  if (state.activity === null) {
    return 6;
  }

  if (state.goalType === null) {
    return 7;
  }

  return 8;
}

export function buildProteinPreview(state: OnboardingWizardState): ProteinPreview | null {
  if (!isWeightValid(state.weightKg) || state.activity === null) {
    return null;
  }

  const weightKg = state.weightKg!;
  const bodyFatPct = resolveBodyFatPct(state);
  if (bodyFatPct === null) {
    return null;
  }

  const category = getCategory(state.gender, bodyFatPct);
  const proteinRange = getProteinRange(category, state.activity);
  const proteinMultiplier = calcProteinMultiplier(
    state.gender,
    bodyFatPct,
    state.activity,
  );
  const proteinTargetG = calcProteinTarget(
    weightKg,
    bodyFatPct,
    state.gender,
    state.activity,
  );
  const bmiResult =
    state.bodyFatMode === "bmi" ? getBmiEstimate(state).bmi : null;

  return {
    bmi: bmiResult === null ? null : roundTo(bmiResult, 1),
    bodyFatPct,
    category,
    proteinRange,
    proteinMultiplier: roundTo(proteinMultiplier, 2),
    proteinTargetG,
    estimatedCalories: calcEstimatedCalories(proteinTargetG),
    leanBodyMassKg: roundTo(calcLeanBodyMassKg(weightKg, bodyFatPct), 1),
    leanBodyMassLbs: roundTo(calcLeanBodyMassLbs(weightKg, bodyFatPct), 1),
  };
}

export function buildOnboardingPreview(
  state: OnboardingWizardState,
): OnboardingPreview | null {
  if (!isNameValid(state.userName) || state.goalType === null) {
    return null;
  }

  const proteinPreview = buildProteinPreview(state);
  if (!proteinPreview) {
    return null;
  }

  return {
    ...proteinPreview,
    goalTotalDays: GOAL_DAYS[state.goalType],
    startDate: getTodayDate(),
  };
}

export function buildOnboardingProfile(
  state: OnboardingWizardState,
): OnboardingProfile | null {
  const preview = buildOnboardingPreview(state);
  if (
    !preview ||
    !isWeightValid(state.weightKg) ||
    state.activity === null ||
    state.goalType === null
  ) {
    return null;
  }

  const startingWeightKg = state.weightKg!;

  return {
    userName: state.userName.trim(),
    startDate: preview.startDate,
    startingWeightKg,
    proteinTargetG: preview.proteinTargetG,
    gender: state.gender,
    bodyFatPct: preview.bodyFatPct,
    activity: state.activity,
    goalType: state.goalType,
    goalTotalDays: preview.goalTotalDays,
  };
}
