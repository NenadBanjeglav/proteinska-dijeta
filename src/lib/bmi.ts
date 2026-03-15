import { BMI_ROWS, FEMALE_BF, MALE_BF } from "@/src/constants/bmi-table";
import type { Gender } from "@/src/types/app";

function getBmiSeries(gender: Gender) {
  return gender === "male" ? MALE_BF : FEMALE_BF;
}

function getExactMatchIndex(bmi: number) {
  return BMI_ROWS.findIndex((row) => row === bmi);
}

function getBracketIndex(bmi: number) {
  return BMI_ROWS.findIndex((row, index) => bmi >= row && bmi < BMI_ROWS[index + 1]);
}

export function calcBmi(weightKg: number, heightM: number) {
  return weightKg / (heightM * heightM);
}

export function canEstimateBodyFatFromBmi(bmi: number, gender: Gender) {
  if (bmi < 13) {
    return false;
  }

  if (bmi > 40) {
    return true;
  }

  const series = getBmiSeries(gender);
  const exactIndex = getExactMatchIndex(bmi);

  if (exactIndex >= 0) {
    return series[exactIndex] !== null;
  }

  const lowerIndex = getBracketIndex(bmi);
  if (lowerIndex < 0) {
    return false;
  }

  return series[lowerIndex] !== null && series[lowerIndex + 1] !== null;
}

export function estimateBodyFatFromBmi(bmi: number, gender: Gender) {
  if (!canEstimateBodyFatFromBmi(bmi, gender)) {
    return null;
  }

  const series = getBmiSeries(gender);

  if (bmi > 40) {
    const base = series[series.length - 1];
    if (base === null) {
      return null;
    }

    return base + (bmi - 40) * 1.5;
  }

  const exactIndex = getExactMatchIndex(bmi);
  if (exactIndex >= 0) {
    const exactValue = series[exactIndex];
    return exactValue === null ? null : exactValue;
  }

  const lowerIndex = getBracketIndex(bmi);
  if (lowerIndex < 0) {
    return null;
  }

  const lowerValue = series[lowerIndex];
  const upperValue = series[lowerIndex + 1];
  if (lowerValue === null || upperValue === null) {
    return null;
  }

  const lowerBmi = BMI_ROWS[lowerIndex];
  const upperBmi = BMI_ROWS[lowerIndex + 1];
  const ratio = (bmi - lowerBmi) / (upperBmi - lowerBmi);

  return lowerValue + ratio * (upperValue - lowerValue);
}
