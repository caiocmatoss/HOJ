import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

interface CheckinStore {
  currentVenue: string | null;

  checkedInAt: string | null;

  checkin: (
    venueId: string,
  ) => void;

  checkout: () => void;

  isCheckedIn: (
    venueId: string,
  ) => boolean;
}

export const useCheckinStore =
  create<CheckinStore>()(
    persist(
      (set, get) => ({
        currentVenue:
          null,

        checkedInAt:
          null,

        checkin: (
          venueId,
        ) =>
          set({
            currentVenue:
              venueId,

            checkedInAt:
              new Date().toISOString(),
          }),

        checkout: () =>
          set({
            currentVenue:
              null,

            checkedInAt:
              null,
          }),

        isCheckedIn: (
          venueId,
        ) =>
          get().currentVenue ===
          venueId,
      }),

      {
        name:
          "hojeond-checkin",

        storage:
          createJSONStorage(
            () =>
              AsyncStorage,
          ),

        partialize: (
          state,
        ) => ({
          currentVenue:
            state.currentVenue,

          checkedInAt:
            state.checkedInAt,
        }),
      },
    ),
  );