import type { GoalType, MealSupplementKey } from "@/src/types/app";

export const GOAL_DAYS: Record<GoalType, number> = {
  kickstart: 14,
  plateau: 14,
  event: 21,
  full: 35,
};

export const GOAL_LABELS: Record<GoalType, string> = {
  kickstart: "Pokretanje dijete",
  plateau: "Probijanje platoa",
  event: "Priprema za dogadjaj",
  full: "Puna faza mrsavljenja",
};

export const SUPPLEMENT_GUIDANCE = [
  "Riblje ulje 6 x 1 g dnevno ili 1 kasika lanenog ulja",
  "Natrijum 3-5 g dnevno",
  "Kalijum do 1 g dnevno",
  "Magnezijum 500 mg dnevno",
  "Kalcijum 600-1200 mg dnevno, podeljeno AM/PM",
  "Dnevni multivitamin",
] as const;

export const SUPPLEMENT_CHECKLIST = [
  "Omega-3 / riblje ulje",
  "Dnevni multivitamin",
  "Kalcijum",
  "Magnezijum",
  "Kalijumova so - soli po ukusu",
] as const;

export const MEAL_SUPPLEMENT_DEFINITIONS: {
  key: MealSupplementKey;
  label: string;
  description: string;
  dailyLimit: number | null;
}[] = [
  {
    key: "omega3WithMeal",
    label: "Omega-3",
    description: "2 g uz ovaj obrok",
    dailyLimit: null,
  },
  {
    key: "potassiumSalted",
    label: "Kalijumova so",
    description: "Posoljeno uz ovaj obrok",
    dailyLimit: null,
  },
  {
    key: "multivitamin",
    label: "Multivitamin",
    description: "1 dnevno",
    dailyLimit: 1,
  },
  {
    key: "calcium",
    label: "Kalcijum",
    description: "Do 2 dnevno",
    dailyLimit: 2,
  },
  {
    key: "magnesium",
    label: "Magnezijum",
    description: "1 dnevno",
    dailyLimit: 1,
  },
] as const;
