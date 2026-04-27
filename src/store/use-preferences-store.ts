import { create } from "zustand";

type Language = "en" | "te";

type PreferencesState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  language: "en",
  setLanguage: (language) => set({ language }),
}));
