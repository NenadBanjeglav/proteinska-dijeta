import { getElapsedDays, getTodayDate, sortWeightHistory } from "@/src/lib/date";
import { buildProtocolSnapshot } from "@/src/lib/protocol-context";
import {
  buildGoalProjection,
  type GoalProjection,
} from "@/src/lib/projection";
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
  const snapshot = buildProtocolSnapshot({
    startingWeightKg: inputs.startingWeightKg,
    currentWeightKg: inputs.currentWeightKg ?? inputs.startingWeightKg,
    gender: inputs.gender,
    bodyFatPct: inputs.bodyFatPct,
    activity: inputs.activity,
  });

  if (!snapshot) {
    return {
      currentWeightKg: inputs.currentWeightKg ?? inputs.startingWeightKg,
      estimatedBodyFatPct: null,
      proteinTargetG: null,
      calorieTarget: null,
      projection: null,
      goalTotalDays: null,
    };
  }

  const projection =
    inputs.goalWeightKg === null
      ? null
      : buildGoalProjection({
          startDate: today,
          currentWeightKg: snapshot.currentWeightKg,
          goalWeightKg: inputs.goalWeightKg,
          leanBodyMassKg: snapshot.leanBodyMassKg,
          gender: inputs.gender!,
          activity: inputs.activity!,
        });

  const elapsedBeforeToday =
    inputs.startDate === null ? 0 : Math.max(0, getElapsedDays(inputs.startDate, today) - 1);
  const goalTotalDays =
    projection?.projectedDays === null || projection?.projectedDays === undefined
      ? null
      : elapsedBeforeToday + projection.projectedDays;

  return {
    currentWeightKg: snapshot.currentWeightKg,
    estimatedBodyFatPct: snapshot.estimatedBodyFatPct,
    proteinTargetG: snapshot.proteinTargetG,
    calorieTarget: snapshot.calorieTarget,
    projection,
    goalTotalDays,
  };
}
