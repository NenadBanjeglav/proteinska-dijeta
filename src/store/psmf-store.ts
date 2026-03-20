import { create } from "zustand";

import {
  DEFAULT_STORE,
  clearStore as clearPersistedStore,
  getStore,
  saveMeal as persistMeal,
  saveOnboardingProfile as persistOnboardingProfile,
  updatePlanSettings as persistPlanSettings,
  saveWeightEntry as persistWeightEntry,
  setWaterGlasses as persistWaterGlasses,
  setGoalWeightKg as persistGoalWeightKg,
  setDismissedProteinChangeKey as persistDismissedProteinChangeKey,
  toggleFavoriteFood as persistToggleFavoriteFood,
  deleteMeal as removeMeal,
} from "@/src/store/storage";
import type {
  LoggedMeal,
  OnboardingProfile,
  PSMFAppStore,
  PlanSettingsUpdate,
} from "@/src/types/app";

export const usePsmfStore = create<PSMFAppStore>((set, get) => ({
  status: "idle",
  data: DEFAULT_STORE,

  hydrate: async () => {
    if (get().status === "hydrating") {
      return;
    }

    set({ status: "hydrating" });
    const data = await getStore();
    set({ data, status: "ready" });
  },

  clearStore: async () => {
    const data = await clearPersistedStore();
    set({ data, status: "ready" });
  },

  saveOnboardingProfile: async (profile: OnboardingProfile) => {
    const data = await persistOnboardingProfile(profile);
    set({ data });
  },

  updatePlanSettings: async (input: PlanSettingsUpdate) => {
    const data = await persistPlanSettings(input);
    set({ data });
  },

  setGoalWeightKg: async (goalWeightKg: number) => {
    const data = await persistGoalWeightKg(goalWeightKg);
    set({ data });
  },

  setDismissedProteinChangeKey: async (key: string | null) => {
    const data = await persistDismissedProteinChangeKey(key);
    set({ data });
  },

  saveWeightEntry: async (kg: number, date: string) => {
    const data = await persistWeightEntry(kg, date);
    set({ data });
  },

  saveMeal: async (meal: LoggedMeal) => {
    const data = await persistMeal(meal);
    set({ data });
  },

  deleteMeal: async (mealId: string) => {
    const data = await removeMeal(mealId);
    set({ data });
  },

  toggleFavoriteFood: async (foodId: string) => {
    const data = await persistToggleFavoriteFood(foodId);
    set({ data });
  },

  setWaterGlasses: async (date: string, count: number) => {
    const data = await persistWaterGlasses(date, count);
    set({ data });
  },
}));
