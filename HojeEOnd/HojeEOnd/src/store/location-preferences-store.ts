import { create } from "zustand";

import {
  getLocationPreferences,
  updateLocationPreferences,
  type ApiLocationPreferences,
} from "@/services/api";

type LocationPreferencesState = {
  preferences: ApiLocationPreferences | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasLoaded: boolean;
  loadPreferences: () => Promise<void>;
  updatePreference: <K extends keyof ApiLocationPreferences>(key: K, value: ApiLocationPreferences[K]) => Promise<ApiLocationPreferences>;
  clear: () => void;
};

export const useLocationPreferencesStore = create<LocationPreferencesState>((set, get) => ({
  preferences: null,
  loading: false,
  saving: false,
  error: null,
  hasLoaded: false,
  loadPreferences: async () => {
    set({ loading: true, error: null });
    try {
      const preferences = await getLocationPreferences();
      set({ preferences, hasLoaded: true });
    } catch {
      set({ error: "Não foi possível carregar suas preferências de localização." });
      throw new Error("location preferences load failed");
    } finally {
      set({ loading: false });
    }
  },
  updatePreference: async (key, value) => {
    const previous = get().preferences;
    const optimistic = previous ? { ...previous, [key]: value } : previous;
    set({ preferences: optimistic, saving: true, error: null });
    try {
      const preferences = await updateLocationPreferences({ [key]: value });
      set({ preferences });
      return preferences;
    } catch (error) {
      set({ preferences: previous, error: "Não foi possível salvar essa preferência." });
      throw error;
    } finally {
      set({ saving: false });
    }
  },
  clear: () => set({ preferences: null, loading: false, saving: false, error: null, hasLoaded: false }),
}));
