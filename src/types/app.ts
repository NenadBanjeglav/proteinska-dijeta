export type GoalType = "kickstart" | "plateau" | "event" | "full";
export type Gender = "male" | "female";
export type Activity = "inactive" | "aerobics" | "weights";
export type ProtocolCategory = 1 | 2 | 3;
export type LoggedMealItemKind = "protein" | "vegetable" | "condiment";
export type WeightUnit = "kg" | "lbs";
export type BodyFatInputMode = "manual" | "bmi";
export type HydrationStatus = "idle" | "hydrating" | "ready";

export type WeightEntry = {
  date: string;
  kg: number;
};

export type LoggedMealItem = {
  id: string;
  foodId: string;
  kind: LoggedMealItemKind;
  label: string;
  grams: number;
  proteinG: number;
  calories: number;
};

export type LoggedMeal = {
  id: string;
  name: string;
  items: LoggedMealItem[];
  proteinG: number;
  calories: number;
  date: string;
};

export type PSMFStore = {
  userName: string | null;
  startDate: string | null;
  startingWeightKg: number | null;
  proteinTargetG: number | null;
  gender: Gender | null;
  bodyFatPct: number | null;
  activity: Activity | null;
  goalType: GoalType | null;
  goalTotalDays: number | null;
  weightHistory: WeightEntry[];
  meals: LoggedMeal[];
  waterGlassesByDate: Record<string, number>;
};

export type OnboardingWizardState = {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  userName: string;
  gender: Gender;
  weightKg: number | null;
  weightUnit: WeightUnit;
  bodyFatMode: BodyFatInputMode;
  bodyFatPct: number | null;
  heightCm: number | null;
  activity: Activity | null;
  goalType: GoalType | null;
};

export type OnboardingProfile = {
  userName: string;
  startDate: string;
  startingWeightKg: number;
  proteinTargetG: number;
  gender: Gender;
  bodyFatPct: number;
  activity: Activity;
  goalType: GoalType;
  goalTotalDays: number;
};

export type FoodKind = "protein" | "vegetable" | "condiment";
export type FoodPriority = "tierA" | "tierB" | "limited" | "condiment";
export type FoodBasis = "raw" | "drained" | "asPackaged";

export type FoodItem = {
  id: string;
  label: string;
  kind: FoodKind;
  priority: FoodPriority;
  basis: FoodBasis;
  proteinPer100g: number;
  caloriesPer100g: number;
};

export type PSMFAppStore = {
  status: HydrationStatus;
  data: PSMFStore;
  hydrate: () => Promise<void>;
  clearStore: () => Promise<void>;
  saveOnboardingProfile: (profile: OnboardingProfile) => Promise<void>;
  saveWeightEntry: (kg: number, date: string) => Promise<void>;
  saveMeal: (meal: LoggedMeal) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  setWaterGlasses: (date: string, count: number) => Promise<void>;
};
