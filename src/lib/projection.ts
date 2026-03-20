import { addDays } from "@/src/lib/date";
import {
  calcBodyFatPctFromLeanMass,
  calcEstimatedCalories,
  calcLeanBodyMassKg,
  calcProteinTarget,
} from "@/src/lib/psmf";
import { roundTo } from "@/src/lib/units";
import type { Activity, Gender } from "@/src/types/app";

const ACTIVITY_TDEE_MULTIPLIERS: Record<Activity, number> = {
  inactive: 1.2,
  aerobics: 1.375,
  weights: 1.55,
};

const MAX_PROJECTION_DAYS = 365;

export type GoalProjectionStatus = "ok" | "caution" | "invalid";

export type GoalProjectionPoint = {
  day: number;
  date: string;
  weightKg: number;
};

export type GoalProjection = {
  status: GoalProjectionStatus;
  message: string;
  currentWeightKg: number;
  goalWeightKg: number;
  remainingKg: number;
  projectedDays: number | null;
  projectedTargetDate: string | null;
  projectedGoalBodyFatPct: number | null;
  chartPoints: GoalProjectionPoint[];
};

type GoalProjectionInput = {
  startDate: string;
  currentWeightKg: number;
  goalWeightKg: number;
  leanBodyMassKg: number;
  gender: Gender;
  activity: Activity;
};

function buildInvalidProjection(
  params: Pick<GoalProjectionInput, "currentWeightKg" | "goalWeightKg">,
  message: string,
  projectedGoalBodyFatPct: number | null = null,
): GoalProjection {
  return {
    status: "invalid",
    message,
    currentWeightKg: roundTo(params.currentWeightKg, 1),
    goalWeightKg: roundTo(params.goalWeightKg, 1),
    remainingKg: roundTo(Math.max(0, params.currentWeightKg - params.goalWeightKg), 1),
    projectedDays: null,
    projectedTargetDate: null,
    projectedGoalBodyFatPct,
    chartPoints: [],
  };
}

function getLeanGoalThreshold(gender: Gender) {
  return gender === "male" ? 8 : 16;
}

function getInvalidMessage(reason: "goal" | "lean-mass" | "deficit" | "duration") {
  switch (reason) {
    case "goal":
      return "Ciljna težina mora da bude niža od trenutne težine.";
    case "lean-mass":
      return "Ciljna težina je ispod procenjene nemasne mase. Podigni cilj ili proveri procenat masti.";
    case "deficit":
      return "Sa ovim podacima ne dobijamo smislen kalorijski minus. Proveri unos ili cilj.";
    case "duration":
      return "Do cilja bi trebalo previše dugo u jednoj strogoj fazi. Podigni ciljnu težinu.";
  }
}

function getCautionMessage(params: {
  projectedDays: number;
  projectedGoalBodyFatPct: number | null;
  gender: Gender;
}) {
  const leanThreshold = getLeanGoalThreshold(params.gender);

  if (
    params.projectedGoalBodyFatPct !== null &&
    params.projectedGoalBodyFatPct < leanThreshold
  ) {
    return "Cilj te vodi vrlo nisko sa procentom masti. Procena ne računa pauze, refeede ni adaptaciju.";
  }

  if (params.projectedDays > 42) {
    return "Procena pretpostavlja strogi PSMF bez pauza. Za ovako dug period rezultat je verovatno realniji kroz etape.";
  }

  return "Procena pretpostavlja strogi PSMF bez planiranih pauza.";
}

export function calcBmrKatchMcArdle(leanBodyMassKg: number) {
  return roundTo(370 + 21.6 * leanBodyMassKg, 0);
}

export function buildGoalProjection({
  startDate,
  currentWeightKg,
  goalWeightKg,
  leanBodyMassKg,
  gender,
  activity,
}: GoalProjectionInput): GoalProjection {
  const roundedCurrentWeightKg = roundTo(currentWeightKg, 1);
  const roundedGoalWeightKg = roundTo(goalWeightKg, 1);
  const remainingKg = roundTo(
    Math.max(0, roundedCurrentWeightKg - roundedGoalWeightKg),
    1,
  );

  if (roundedCurrentWeightKg <= roundedGoalWeightKg) {
    const currentBodyFatPct = calcBodyFatPctFromLeanMass(
      roundedCurrentWeightKg,
      leanBodyMassKg,
    );

    return {
      status: "ok",
      message: "Ciljna težina je već dostignuta. Održavaj ritam i koristi graf istorije da pratiš stabilizaciju.",
      currentWeightKg: roundedCurrentWeightKg,
      goalWeightKg: roundedGoalWeightKg,
      remainingKg: 0,
      projectedDays: 0,
      projectedTargetDate: startDate,
      projectedGoalBodyFatPct: currentBodyFatPct,
      chartPoints: [],
    };
  }

  if (!Number.isFinite(leanBodyMassKg) || leanBodyMassKg <= 0) {
    return buildInvalidProjection(
      { currentWeightKg: roundedCurrentWeightKg, goalWeightKg: roundedGoalWeightKg },
      getInvalidMessage("lean-mass"),
    );
  }

  const projectedGoalBodyFatPct = calcBodyFatPctFromLeanMass(
    roundedGoalWeightKg,
    leanBodyMassKg,
  );

  if (projectedGoalBodyFatPct === null) {
    return buildInvalidProjection(
      { currentWeightKg: roundedCurrentWeightKg, goalWeightKg: roundedGoalWeightKg },
      getInvalidMessage("lean-mass"),
    );
  }

  const bmr = calcBmrKatchMcArdle(leanBodyMassKg);
  const tdee = bmr * ACTIVITY_TDEE_MULTIPLIERS[activity];
  const chartPoints: GoalProjectionPoint[] = [
    {
      day: 0,
      date: startDate,
      weightKg: roundedCurrentWeightKg,
    },
  ];

  let simulatedWeightKg = roundedCurrentWeightKg;
  let projectedDays: number | null = null;

  for (let day = 1; day <= MAX_PROJECTION_DAYS; day += 1) {
    const simulatedBodyFatPct = calcBodyFatPctFromLeanMass(
      simulatedWeightKg,
      leanBodyMassKg,
    );

    if (simulatedBodyFatPct === null) {
      return buildInvalidProjection(
        { currentWeightKg: roundedCurrentWeightKg, goalWeightKg: roundedGoalWeightKg },
        getInvalidMessage("lean-mass"),
        projectedGoalBodyFatPct,
      );
    }

    const proteinTargetG = calcProteinTarget(
      simulatedWeightKg,
      simulatedBodyFatPct,
      gender,
      activity,
    );
    const dietCalories = calcEstimatedCalories(proteinTargetG);
    const dailyDeficit = tdee - dietCalories;

    if (dailyDeficit <= 0) {
      return buildInvalidProjection(
        { currentWeightKg: roundedCurrentWeightKg, goalWeightKg: roundedGoalWeightKg },
        getInvalidMessage("deficit"),
        projectedGoalBodyFatPct,
      );
    }

    const dailyLossKg = dailyDeficit / 7700;
    simulatedWeightKg = roundTo(simulatedWeightKg - dailyLossKg, 3);

    if (day % 7 === 0 || simulatedWeightKg <= roundedGoalWeightKg || day === 1) {
      chartPoints.push({
        day,
        date: addDays(startDate, day),
        weightKg: roundTo(Math.max(simulatedWeightKg, roundedGoalWeightKg), 1),
      });
    }

    if (simulatedWeightKg <= roundedGoalWeightKg) {
      projectedDays = day;
      break;
    }
  }

  if (projectedDays === null) {
    return buildInvalidProjection(
      { currentWeightKg: roundedCurrentWeightKg, goalWeightKg: roundedGoalWeightKg },
      getInvalidMessage("duration"),
      projectedGoalBodyFatPct,
    );
  }

  const chartEnd = chartPoints[chartPoints.length - 1];
  if (!chartEnd || chartEnd.day !== projectedDays) {
    chartPoints.push({
      day: projectedDays,
      date: addDays(startDate, projectedDays),
      weightKg: roundedGoalWeightKg,
    });
  }

  const status: GoalProjectionStatus =
    projectedDays > 42 || projectedGoalBodyFatPct < getLeanGoalThreshold(gender)
      ? "caution"
      : "ok";

  return {
    status,
    message: getCautionMessage({
      projectedDays,
      projectedGoalBodyFatPct,
      gender,
    }),
    currentWeightKg: roundedCurrentWeightKg,
    goalWeightKg: roundedGoalWeightKg,
    remainingKg,
    projectedDays,
    projectedTargetDate: addDays(startDate, projectedDays),
    projectedGoalBodyFatPct,
    chartPoints,
  };
}

export function buildProjectionFromBodyFat(params: {
  startDate: string;
  currentWeightKg: number;
  goalWeightKg: number;
  bodyFatPct: number;
  gender: Gender;
  activity: Activity;
}) {
  return buildGoalProjection({
    startDate: params.startDate,
    currentWeightKg: params.currentWeightKg,
    goalWeightKg: params.goalWeightKg,
    leanBodyMassKg: calcLeanBodyMassKg(params.currentWeightKg, params.bodyFatPct),
    gender: params.gender,
    activity: params.activity,
  });
}

export function formatProjectionDate(dateKey: string) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateKey}T00:00:00`));
}

export function formatProjectedDays(projectedDays: number | null) {
  if (projectedDays === null) {
    return "bez procene";
  }

  if (projectedDays === 0) {
    return "danas";
  }

  if (projectedDays === 1) {
    return "1 dan";
  }

  return `${projectedDays} dana`;
}
