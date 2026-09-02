import { create } from "zustand";

import {
  checkIn,
  checkOut,
  getCheckinHistory,
  getMyCheckin,
  type ApiCheckin,
} from "@/services/api";

interface CheckinStore {
  currentVenue: string | null;
  checkedInAt: string | null;
  currentCheckin: ApiCheckin | null;
  history: ApiCheckin[];
  loading: boolean;
  processing: boolean;
  error: string | null;
  loadCurrentCheckin: () => Promise<void>;
  loadHistory: () => Promise<void>;
  checkin: (venueId: string) => Promise<void>;
  checkout: () => Promise<void>;
  isCheckedIn: (venueId: string) => boolean;
  clearError: () => void;
}

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useCheckinStore = create<CheckinStore>()((set, get) => ({
  currentVenue: null,
  checkedInAt: null,
  currentCheckin: null,
  history: [],
  loading: false,
  processing: false,
  error: null,

  loadCurrentCheckin: async () => {
    set({ loading: true, error: null });
    try {
      const checkin = await getMyCheckin();
      set({
        currentCheckin: checkin,
        currentVenue: checkin?.venueId ?? null,
        checkedInAt: checkin?.checkedInAt ?? null,
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: errorMessage(error, "Não foi possível carregar seu check-in.") });
    }
  },

  loadHistory: async () => {
    set({ loading: true, error: null });
    try {
      const history = await getCheckinHistory();
      set({ history, loading: false });
    } catch (error) {
      set({ loading: false, error: errorMessage(error, "Não foi possível carregar o histórico de check-ins.") });
    }
  },

  checkin: async (venueId) => {
    if (!venueId || get().processing) return;
    set({ processing: true, error: null });
    try {
      const response = await checkIn(venueId);
      set({
        currentCheckin: response.checkin,
        currentVenue: response.checkin.venueId,
        checkedInAt: response.checkin.checkedInAt,
        processing: false,
      });
    } catch (error) {
      set({ processing: false, error: errorMessage(error, "Não foi possível fazer check-in.") });
      throw error;
    }
  },

  checkout: async () => {
    const venueId = get().currentVenue;
    if (!venueId || get().processing) return;
    set({ processing: true, error: null });
    try {
      await checkOut(venueId);
      set({ currentCheckin: null, currentVenue: null, checkedInAt: null, processing: false });
    } catch (error) {
      set({ processing: false, error: errorMessage(error, "Não foi possível fazer checkout.") });
      throw error;
    }
  },

  isCheckedIn: (venueId) => get().currentVenue === venueId,
  clearError: () => set({ error: null }),
}));