import { calcBodyFatPctFromLeanMass, calcEstimatedCalories, calcLeanBodyMassKg, calcProteinTarget } from "@/src/lib/psmf";
import type { Activity, Gender } from "@/src/types/app";

type ProtocolSnapshotInput = {
  startingWeightKg: number | null;
  currentWeightKg: number | null;
  gender: Gender | null;
  bodyFatPct: number | null;
  activity: Activity | null;
};

export type ProtocolSnapshot = {
  currentWeightKg: number;
  leanBodyMassKg: number;
  estimatedBodyFatPct: number;
  proteinTargetG: number;
  calorieTarget: number;
};

export function buildProtocolSnapshot(
  input: ProtocolSnapshotInput,
): ProtocolSnapshot | null {
  if (
    input.startingWeightKg === null ||
    input.currentWeightKg === null ||
    input.gender === null ||
    input.bodyFatPct === null ||
    input.activity === null
  ) {
    return null;
  }

  const leanBodyMassKg = calcLeanBodyMassKg(
    input.startingWeightKg,
    input.bodyFatPct,
  );
  const estimatedBodyFatPct = calcBodyFatPctFromLeanMass(
    input.currentWeightKg,
    leanBodyMassKg,
  );

  if (estimatedBodyFatPct === null) {
    return null;
  }

  const proteinTargetG = calcProteinTarget(
    input.currentWeightKg,
    estimatedBodyFatPct,
    input.gender,
    input.activity,
  );

  return {
    currentWeightKg: input.currentWeightKg,
    leanBodyMassKg,
    estimatedBodyFatPct,
    proteinTargetG,
    calorieTarget: calcEstimatedCalories(proteinTargetG),
  };
}
