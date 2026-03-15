import type { GoalType, ProtocolCategory } from "@/src/types/app";

export const GOAL_DAYS: Record<GoalType, number> = {
  kickstart: 14,
  plateau: 14,
  event: 21,
  full: 35,
};

export const SUPPLEMENT_GUIDANCE = [
  "Riblje ulje 6 x 1 g dnevno ili 1 kašika lanenog ulja",
  "Natrijum 3-5 g dnevno",
  "Kalijum do 1 g dnevno",
  "Magnezijum 500 mg dnevno",
  "Kalcijum 600-1200 mg dnevno, podeljeno AM/PM",
  "Dnevni multivitamin",
] as const;

export const PROTOCOL_GUIDANCE: Record<
  ProtocolCategory,
  {
    mainStretch: string;
    freeMeals: string;
    refeed: string;
    postStretch: string;
  }
> = {
  1: {
    mainStretch: "11-12 dana",
    freeMeals: "Bez redovnih free meal obroka",
    refeed: "2-3 high-carb dana na kraju",
    postStretch: "Povratak na normalniji režim dijete",
  },
  2: {
    mainStretch: "2-6 nedelja",
    freeMeals: "1 free meal nedeljno",
    refeed: "Jedan 5-časovni refeed nedeljno",
    postStretch: "2 nedelje diet break",
  },
  3: {
    mainStretch: "6-12 nedelja",
    freeMeals: "2 free meal obroka nedeljno",
    refeed: "Bez strukturiranog refeed-a",
    postStretch: "2 nedelje diet break",
  },
};
