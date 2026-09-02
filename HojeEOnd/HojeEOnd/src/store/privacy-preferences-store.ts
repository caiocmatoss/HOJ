import { create } from "zustand";
import { getPrivacyPreferences, updatePrivacyPreferences, type ApiPrivacyPreferences } from "@/services/api";
type State = { preferences: ApiPrivacyPreferences | null; loading: boolean; error: string | null; load: () => Promise<void>; update: (key: keyof ApiPrivacyPreferences, value: boolean) => Promise<void>; clear: () => void };
export const usePrivacyPreferencesStore = create<State>((set, get) => ({ preferences: null, loading: false, error: null,
  load: async () => { set({ loading: true, error: null }); try { set({ preferences: await getPrivacyPreferences() }); } catch { set({ error: "Não foi possível carregar suas preferências de privacidade." }); } finally { set({ loading: false }); } },
  update: async (key, value) => { const previous = get().preferences; set({ preferences: previous ? { ...previous, [key]: value } : previous }); try { set({ preferences: await updatePrivacyPreferences({ [key]: value }) }); } catch (error) { set({ preferences: previous, error: "Não foi possível salvar essa preferência." }); throw error; } },
  clear: () => set({ preferences: null, loading: false, error: null }),
}));
