import { getElapsedDays, getTodayDate, sortWeightHistory } from "@/src/lib/date";
import {
  buildGoalProjection,
  type GoalProjection,
} from "@/src/lib/projection";
import {
  calcBodyFatPctFromLeanMass,
  calcEstimatedCalories,
  calcLeanBodyMassKg,
  calcProteinTarget,
} from "@/src/lib/psmf";
import type { Activity, Gender, PSMFStore } from "@/src/types/app";

export type EditablePlanInputs = {
  startDate: string | null;
  startingWeightKg: number | null;
  currentWeightKg: number | null;
  goalWeightKg: number | null;
  gender: Gender | null;
  bodyFatPct: number | null;
  activity: Activity | null;
};

export type PlanSummary = {
  currentWeightKg: number | null;
  estimatedBodyFatPct: number | null;
  proteinTargetG: number | null;
  calorieTarget: number | null;
  projection: GoalProjection | null;
  goalTotalDays: number | null;
};

export function getCurrentWeightKgFromStore(
  store: Pick<PSMFStore, "weightHistory" | "startingWeightKg">,
) {
  const history = sortWeightHistory(store.weightHistory);
  return history[history.length - 1]?.kg ?? store.startingWeightKg;
}

export function buildPlanSummary(
  inputs: EditablePlanInputs,
  today = getTodayDate(),
): PlanSummary {
  const currentWeightKg = inputs.currentWeightKg ?? inputs.startingWeightKg;

  if (
    inputs.startingWeightKg === null ||
    currentWeightKg === null ||
    inputs.gender === null ||
    inputs.bodyFatPct === null ||
    inputs.activity === null
  ) {
    return {
      currentWeightKg,
      estimatedBodyFatPct: null,
      proteinTargetG: null,
      calorieTarget: null,
      projection: null,
      goalTotalDays: null,
    };
  }

  const leanBodyMassKg = calcLeanBodyMassKg(
    inputs.startingWeightKg,
    inputs.bodyFatPct,
  );
  const estimatedBodyFatPct = calcBodyFatPctFromLeanMass(
    currentWeightKg,
    leanBodyMassKg,
  );

  if (estimatedBodyFatPct === null) {
    return {
      currentWeightKg,
      estimatedBodyFatPct: null,
      proteinTargetG: null,
      calorieTarget: null,
      projection: null,
      goalTotalDays: null,
    };
  }

  const proteinTargetG = calcProteinTarget(
    currentWeightKg,
    estimatedBodyFatPct,
    inputs.gender,
    inputs.activity,
  );
  const projection =
    inputs.goalWeightKg === null
      ? null
      : buildGoalProjection({
          startDate: today,
          currentWeightKg,
          goalWeightKg: inputs.goalWeightKg,
          leanBodyMassKg,
          gender: inputs.gender,
          activity: inputs.activity,
        });

  const elapsedBeforeToday =
    inputs.startDate === null ? 0 : Math.max(0, getElapsedDays(inputs.startDate, today) - 1);
  const goalTotalDays =
    projection?.projectedDays === null || projection?.projectedDays === undefined
      ? null
      : elapsedBeforeToday + projection.projectedDays;

  return {
    currentWeightKg,
    estimatedBodyFatPct,
    proteinTargetG,
    calorieTarget: calcEstimatedCalories(proteinTargetG),
    projection,
    goalTotalDays,
  };
}
