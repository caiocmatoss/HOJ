import { create } from "zustand";

interface CheckinStore {
  currentVenue: string | null;
  checkedInAt: string | null;
  checkin: (venueId: string) => void;
  checkout: () => void;
  isCheckedIn: (venueId: string) => boolean;
}

export const useCheckinStore =
  create<CheckinStore>((set, get) => ({
    currentVenue: null,
    checkedInAt: null,

    checkin: (venueId) =>
      set({
        currentVenue: venueId,
        checkedInAt: new Date().toISOString(),
      }),

    checkout: () =>
      set({
        currentVenue: null,
        checkedInAt: null,
      }),

    isCheckedIn: (venueId) =>
      get().currentVenue === venueId,
  }));