import { create } from "zustand";

import {
  DEFAULT_STORE,
  clearStore as clearPersistedStore,
  getStore,
  saveMeal as persistMeal,
  saveOnboardingProfile as persistOnboardingProfile,
  saveWeightEntry as persistWeightEntry,
  setWaterGlasses as persistWaterGlasses,
  deleteMeal as removeMeal,
} from "@/src/store/storage";
import type { LoggedMeal, OnboardingProfile, PSMFAppStore } from "@/src/types/app";

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

  setWaterGlasses: async (date: string, count: number) => {
    const data = await persistWaterGlasses(date, count);
    set({ data });
  },
}));
