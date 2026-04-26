export type Gender = "male" | "female";
export type Activity = "inactive" | "aerobics" | "weights";
export type ProtocolCategory = 1 | 2 | 3;
export type LoggedMealItemKind = "protein" | "vegetable" | "fruit" | "condiment";
export type WeightUnit = "kg" | "lbs";
export type BodyFatInputMode = "manual" | "bmi";
export type HydrationStatus = "idle" | "hydrating" | "ready";

export type WeightEntry = {
  date: string;
  kg: number;
};

export type MealSupplementKey =
  | "omega3WithMeal"
  | "potassiumSalted"
  | "multivitamin"
  | "calcium"
  | "magnesium";

export type MealSupplements = Record<MealSupplementKey, boolean>;

export type LoggedMealItem = {
  id: string;
  foodId: string;
  kind: LoggedMealItemKind;
  label: string;
  grams: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number;
};

export type LoggedMeal = {
  id: string;
  name: string;
  customName: string | null;
  items: LoggedMealItem[];
  supplements: MealSupplements;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number;
  date: string;
};

export type MealTemplate = {
  id: string;
  name: string;
  customName: string | null;
  items: LoggedMealItem[];
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number;
  createdAt: string;
  updatedAt: string;
};

export type PSMFStore = {
  userName: string | null;
  startDate: string | null;
  startingWeightKg: number | null;
  goalWeightKg: number | null;
  proteinTargetG: number | null;
  dismissedProteinChangeKey: string | null;
  gender: Gender | null;
  bodyFatPct: number | null;
  activity: Activity | null;
  goalTotalDays: number | null;
  weightHistory: WeightEntry[];
  meals: LoggedMeal[];
  mealTemplates: MealTemplate[];
  favoriteFoodIds: string[];
  foodGramsById: Record<string, number>;
  waterGlassesByDate: Record<string, number>;
};

export type OnboardingWizardState = {
  step: 1 | 2 | 3 | 4 | 5;
  userName: string;
  gender: Gender;
  weightKg: number | null;
  goalWeightKg: number | null;
  weightUnit: WeightUnit;
  bodyFatMode: BodyFatInputMode;
  bodyFatPct: number | null;
  heightCm: number | null;
  activity: Activity | null;
};

export type OnboardingProfile = {
  userName: string | null;
  startDate: string;
  startingWeightKg: number;
  goalWeightKg: number;
  proteinTargetG: number;
  gender: Gender;
  bodyFatPct: number;
  activity: Activity;
  goalTotalDays: number | null;
};

export type PlanSettingsUpdate = {
  userName: string | null;
  gender: Gender;
  bodyFatPct: number;
  activity: Activity;
  goalWeightKg: number;
  proteinTargetG: number;
  goalTotalDays: number | null;
};

export type FoodKind = "protein" | "vegetable" | "fruit" | "condiment";
export type FoodPriority = "tierA" | "tierB" | "limited" | "condiment";
export type FoodBasis = "raw" | "drained" | "asPackaged";

export type FoodItem = {
  id: string;
  label: string;
  kind: FoodKind;
  priority: FoodPriority;
  basis: FoodBasis;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  caloriesPer100g: number;
};

export type PSMFAppStore = {
  status: HydrationStatus;
  data: PSMFStore;
  hydrate: () => Promise<void>;
  clearStore: () => Promise<void>;
  saveOnboardingProfile: (profile: OnboardingProfile) => Promise<void>;
  updatePlanSettings: (input: PlanSettingsUpdate) => Promise<void>;
  setGoalWeightKg: (goalWeightKg: number) => Promise<void>;
  setDismissedProteinChangeKey: (key: string | null) => Promise<void>;
  saveWeightEntry: (kg: number, date: string) => Promise<void>;
  saveMeal: (meal: LoggedMeal) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  saveMealTemplate: (meal: LoggedMeal) => Promise<void>;
  deleteMealTemplate: (templateId: string) => Promise<void>;
  renameMealTemplate: (templateId: string, name: string) => Promise<void>;
  toggleFavoriteFood: (foodId: string) => Promise<void>;
  setWaterGlasses: (date: string, count: number) => Promise<void>;
};
